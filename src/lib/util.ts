import type { EventInput } from '@fullcalendar/core';
import type { PlaceWithBookmark, Restaurant, VisitWithPlace } from '@src/types';

function getNumTypeToday(): { year: number; month: number; date: number } {
  const today: Date = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  return { year, month, date };
}

function getStringTypeToday(): { year: string; month: string; date: string } {
  const today: Date = new Date();
  const year = today.getFullYear().toString();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const date = today.getDate().toString().padStart(2, '0');

  return { year, month, date };
}

function getStringDate({
  year,
  month,
  date,
}: {
  year: number;
  month: number;
  date: number;
}): string {
  return `${year.toString()}-${month.toString().padStart(2, '0')}-${date
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Date를 로컬 시간 기준 'YYYY-MM-DD' 문자열로 변환합니다.
 * toISOString()은 UTC 기준이라 KST 00시~09시 사이에는 전날 날짜가 되므로 쓰지 않습니다.
 * @param date 변환할 날짜
 * @returns 'YYYY-MM-DD'
 */
function toLocalDateString(date: Date): string {
  return getStringDate({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date: date.getDate(),
  });
}

/**
 * 방문 일정을 FullCalendar 종일 이벤트로 변환합니다.
 * @param visit places(place_name)이 포함된 visits 행
 * @returns FullCalendar EventInput
 */
function visitToEvent(visit: VisitWithPlace): EventInput {
  return {
    id: visit.id,
    title: visit.places?.place_name ?? '(알 수 없는 식당)',
    start: visit.visit_date,
    allDay: true,
  };
}

/**
 * Kakao Maps API의 PlacesSearchResult 객체를 Restaurant 타입으로 변환합니다.
 * @param place Kakao Places API 검색 결과 객체
 * @param visitDate 방문 날짜 (선택 사항)
 * @returns Restaurant 타입으로 변환된 객체
 */
function convertPlaceToRestaurant(
  place: kakao.maps.services.PlacesSearchResult,
  visitDate?: string,
): Restaurant {
  // 카테고리 이름을 > 기준으로 분리하여 태그 배열로 변환
  // category_name이 undefined이거나 null인 경우 빈 배열을 사용
  const tags = place.category_name
    ? place.category_name
        .split('>')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== '')
    : [];

  // Restaurant 객체 생성

  const restaurant: Restaurant = {
    name: place.place_name,
    tags: tags,
    address: place.address_name || place.road_address_name,
    period: 0, // 기본값으로 0 설정
    position: {
      x: place.x,
      y: place.y,
    },
    id: place.id,
    place_url: place.place_url,
    distance: place.distance,
  };

  // 방문 날짜가 제공된 경우 추가
  if (visitDate) {
    restaurant.visit = visitDate;
  }

  return restaurant;
}

/**
 * 여러 개의 PlacesSearchResult를 Restaurant 배열로 변환합니다.
 * @param places Kakao Places API 검색 결과 객체 배열
 * @returns Restaurant 타입 배열
 */
function convertPlacesToRestaurants(
  places: kakao.maps.services.PlacesSearchResult[],
): Restaurant[] {
  return places.map((place) => convertPlaceToRestaurant(place));
}

/**
 * Supabase places 행을 일정 추가 모달에 넘길 Restaurant 타입으로 변환합니다.
 * @param place 북마크 여부가 포함된 places 행
 * @returns Restaurant 타입으로 변환된 객체
 */
function convertPlaceRowToRestaurant(place: PlaceWithBookmark): Restaurant {
  return {
    name: place.place_name ?? '',
    tags: place.category_name
      ? place.category_name.split('>').map((t) => t.trim()).filter(Boolean)
      : [],
    address: place.address_name ?? '',
    period: 0,
    position:
      place.latitude && place.longitude
        ? { x: place.longitude, y: place.latitude }
        : undefined,
    id: place.id,
    place_url: place.place_url ?? undefined,
  };
}

const LEGACY_STORAGE_KEYS = ['access_token', 'token_expiry', 'user_id'];

/**
 * 이전(Google Calendar 연동) 버전이 localStorage에 남긴 Google 토큰과 사용자 키를 지웁니다.
 * 현재 세션은 supabase-js가 별도 키(sb-*)로 관리하므로 영향이 없습니다.
 * @param storage 키를 지울 저장소 (보통 window.localStorage)
 */
function removeLegacyStorageKeys(storage: Pick<Storage, 'removeItem'>): void {
  try {
    LEGACY_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
  } catch (error) {
    console.error('Error in removeLegacyStorageKeys:', error);
  }
}

const OAUTH_ERROR_PARAMS = ['error', 'error_code', 'error_description'];

function hasOAuthErrorParam(params: URLSearchParams): boolean {
  return OAUTH_ERROR_PARAMS.some((key) => params.has(key));
}

/**
 * OAuth 로그인이 실패해 돌아온 URL의 query 또는 hash에서 오류 내용을 읽습니다.
 * @param url 확인할 URL (보통 window.location.href)
 * @returns 오류 설명(없으면 오류 코드), 오류가 없으면 null
 */
function getOAuthErrorFromUrl(url: string): string | null {
  const { search, hash } = new URL(url);
  for (const params of [new URLSearchParams(search), new URLSearchParams(hash.slice(1))]) {
    if (hasOAuthErrorParam(params)) {
      return (
        params.get('error_description') ||
        params.get('error_code') ||
        params.get('error') ||
        'unknown_error'
      );
    }
  }
  return null;
}

/**
 * URL의 query와 hash에서 OAuth 오류 파라미터를 지웁니다. 오류 파라미터가 없는 부분은 건드리지 않습니다.
 * @param url 정리할 URL (보통 window.location.href)
 * @returns 정리된 URL
 */
function removeOAuthErrorParams(url: string): string {
  const parsed = new URL(url);

  const searchParams = new URLSearchParams(parsed.search);
  if (hasOAuthErrorParam(searchParams)) {
    OAUTH_ERROR_PARAMS.forEach((key) => searchParams.delete(key));
    parsed.search = searchParams.toString();
  }

  const hashParams = new URLSearchParams(parsed.hash.slice(1));
  if (hasOAuthErrorParam(hashParams)) {
    OAUTH_ERROR_PARAMS.forEach((key) => hashParams.delete(key));
    parsed.hash = hashParams.toString();
  }

  return parsed.toString();
}

export {
  getNumTypeToday,
  getStringDate,
  toLocalDateString,
  visitToEvent,
  convertPlaceToRestaurant,
  convertPlacesToRestaurants,
  convertPlaceRowToRestaurant,
  getStringTypeToday,
  removeLegacyStorageKeys,
  getOAuthErrorFromUrl,
  removeOAuthErrorParams,
};
