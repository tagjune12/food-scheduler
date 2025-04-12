function getNumTypeToday(): { year: number; month: number; date: number } {
  const today: Date = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

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

// 토큰 저장 함수
function saveToken(token: string, expiresIn: number): void {
  const expiryTime = new Date().getTime() + expiresIn * 1000;
  localStorage.setItem('access_token', token);
  localStorage.setItem('token_expiry', expiryTime.toString());
}

// 토큰 유효성 검사 함수
function isTokenValid(): boolean {
  const expiryTime = localStorage.getItem('token_expiry');
  if (!expiryTime) return false;
  
  const now = new Date().getTime();
  return now < parseInt(expiryTime);
}

// 저장된 토큰 가져오기 함수
function getStoredToken(): string | null {
  if (!isTokenValid()) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expiry');
    return null;
  }
  
  return localStorage.getItem('access_token');
}

// Kakao Places API의 PlacesSearchResult를 Restaurant 타입으로 변환하는 함수
interface PlacesSearchResult {
  address_name: string;
  category_group_code: string;
  category_group_name: string;
  category_name: string;
  distance: string;
  id: string;
  phone: string;
  place_name: string;
  place_url: string;
  road_address_name: string;
  x: string;
  y: string;
}

// Restaurant 타입 정의 (index.d.ts와 일치해야 함)
interface Restaurant {
  name: string;
  tags: string[];
  address: string;
  period: number;
  position?: {
    x: string;
    y: string;
  };
  visit?: string;
  place_url?: string;
  id?: string;
  distance?: string;
}

/**
 * Kakao Maps API의 PlacesSearchResult 객체를 Restaurant 타입으로 변환합니다.
 * @param place Kakao Places API 검색 결과 객체
 * @param visitDate 방문 날짜 (선택 사항)
 * @returns Restaurant 타입으로 변환된 객체
 */
function convertPlaceToRestaurant(place: PlacesSearchResult, visitDate?: string): Restaurant {
  // 카테고리 이름을 > 기준으로 분리하여 태그 배열로 변환
  const tags = place.category_name.split(' > ').filter(tag => tag.trim() !== '');
  
  // Restaurant 객체 생성
  const restaurant: Restaurant = {
    name: place.place_name,
    tags: tags,
    address: place.address_name || place.road_address_name,
    period: 0, // 기본값으로 0 설정
    position: {
      x: place.x,
      y: place.y
    },
    id: place.id,
    place_url: place.place_url,
    distance: place.distance
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
function convertPlacesToRestaurants(places: PlacesSearchResult[]): Restaurant[] {
  return places.map(place => convertPlaceToRestaurant(place));
}

export { 
  getNumTypeToday, 
  getStringDate, 
  saveToken, 
  isTokenValid, 
  getStoredToken,
  convertPlaceToRestaurant,
  convertPlacesToRestaurants
};
