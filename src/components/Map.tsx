import React, { useEffect, useRef, useCallback, useState } from 'react';

import '@components/Map.scss';
import { AppStoreType, Restaurant } from '@src/types';
import { createRoot } from 'react-dom/client';
import {
  getPlacesWithNameAndBookmarks,
  getPlacesWithUserBookmarks,
  getRestaurants,
  getRestaurantsWithName,
} from '@lib/api/supabase_api';
import MapCard from './commons/MapCard';
import Fab from '@mui/material/Fab';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useModalDispatch } from '@src/context/ModalContext';
import { useMapInitState } from '@src/context/MapInitContext';
import ListModal from './ListModal';
import { convertPlacesToRestaurants } from '@lib/util';
import {
  useBookMarkActions,
  useBookMarkState,
} from '@src/context/BookMarkContext';

interface MapMarker {
  marker: kakao.maps.Marker;
  restaurant: any; // 오버레이는 미리 생성하지 않고 레스토랑 정보만 저장
}

// interface MarkerStyle {
//   width: string;
//   height: string;
//   backgroundColor: string;
// }

const DEFAULT_CENTER = { lat: 37.4028207, lng: 127.1115201 };
const DEFAULT_ZOOM = 3;

// const MARKER_STYLE: MarkerStyle = {
//   width: '20px',
//   height: '20px',
//   backgroundColor: '#845EC2',
// };

const Map = ({ state }: AppStoreType) => {
  const modalDispatch = useModalDispatch();
  const { initialized: appInitialized } = useMapInitState();
  const { addBookmark, removeBookmark } = useBookMarkActions();

  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const openedMarkerRef = useRef<number | null>(null);
  const markerClustererRef = useRef<kakao.maps.MarkerClusterer | null>(null);
  const clusterOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const currentOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null); // 현재 열린 오버레이 추적
  const [isMapInitialized, setIsMapInitialized] = useState<boolean>(false);
  const [showListModal, setShowListModal] = useState<boolean>(false);
  const [clusterRestaurants, setClusterRestaurants] = useState<any[]>([]);
  const { userId } = useBookMarkState();

  // 마커 클릭시 나타나는 카드 생성 (동적 생성)
  const createMarkerOverlay = useCallback(
    (restaurant: any) => {
      const content = document.createElement('div');
      const root = document.createElement('div');
      content.appendChild(root);

      const lat = parseFloat(restaurant.latitude ?? '0');
      const lng = parseFloat(restaurant.longitude ?? '0');

      // 좌표 유효성 검사
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        console.warn(
          `무효한 좌표로 오버레이 생성 실패: ${restaurant.place_name}`,
        );
        return null;
      }

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(lat, lng),
        content,
        yAnchor: 1,
        clickable: true,
      });

      // React 컴포넌트를 렌더링
      const infoWindow = document.createElement('div');
      root.appendChild(infoWindow);

      // 마우스 휠 이벤트 중지
      infoWindow.addEventListener(
        'wheel',
        (e) => {
          e.stopPropagation();
          e.preventDefault();
        },
        { passive: false },
      );

      // 오버레이 위에서 마우스 휠 동작 시 지도 확대/축소 비활성화
      infoWindow.addEventListener('mouseenter', () => {
        if (mapRef.current) {
          mapRef.current.setZoomable(false);
        }
      });

      // 오버레이 밖으로 마우스가 나갈 때 지도 확대/축소 다시 활성화
      infoWindow.addEventListener('mouseleave', () => {
        if (mapRef.current) {
          mapRef.current.setZoomable(true);
        }
      });

      const card = document.createElement('div');
      infoWindow.appendChild(card);

      const cardContainer = createRoot(card);
      const cardContent = (
        <MapCard
          restaurant={restaurant}
          visitDate={state.histories[restaurant.place_name]?.date}
          onBookmarkAdd={addBookmark}
          onBookmarkRemove={removeBookmark}
        />
      );
      cardContainer.render(cardContent);

      return overlay;
    },
    // [state.histories, addBookmark, removeBookmark],
    [state.histories],
  );

  const createClustererOverlay = useCallback(
    async (cluster: any) => {
      const markerTitles: string[] = [];
      cluster.getMarkers().forEach((c: any) => {
        const title = c.getTitle();
        if (title) markerTitles.push(title);
      });
      // const fetchedRestaurants = await getRestaurantsWithName(markerTitles);
      const fetchedRestaurants = await getPlacesWithNameAndBookmarks(
        userId,
        markerTitles,
      );
      // console.log('fetchedRestaurants', JSON.stringify(fetchedRestaurants));

      // 수신된 데이터를 Restaurant 타입으로 변환
      // const mappedRestaurants: Restaurant[] = fetchedRestaurants.map(
      //   (restaurant) => ({
      //     name: restaurant.place_name ?? '',
      //     tags: (restaurant.category_name ?? '')
      //       .split('>')
      //       .filter((elem) => elem !== '음식점'),
      //     address: restaurant.address_name ?? '',
      //     period: 0,
      //     visit: '',
      //     position: {
      //       x: restaurant.latitude ?? '',
      //       y: restaurant.longitude ?? '',
      //     },
      //     place_url: restaurant.place_url ?? '',
      //   }),
      // );

      setClusterRestaurants(fetchedRestaurants);
      setShowListModal(true);
    },
    [state.histories],
  );

  // 마커 생성
  const createMarker = useCallback((restaurant: any) => {
    try {
      const lat = parseFloat(restaurant.latitude ?? '0');
      const lng = parseFloat(restaurant.longitude ?? '0');

      // 좌표 유효성 검사
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        console.warn(`무효한 좌표로 마커 생성 실패: ${restaurant.place_name}`, {
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          parsedLat: lat,
          parsedLng: lng,
        });
        return null;
      }

      const position = new kakao.maps.LatLng(lat, lng);
      const marker = new kakao.maps.Marker({
        position,
        map: mapRef.current ?? undefined,
      });

      // 커스텀 이미지 설정
      try {
        const imageSrc =
          'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';

        const imageSize = new kakao.maps.Size(20, 20);
        const imageOption = { offset: new kakao.maps.Point(15, 15) };
        const markerImage = new kakao.maps.MarkerImage(
          imageSrc,
          imageSize,
          imageOption,
        );
        marker.setImage(markerImage);
        marker.setTitle(restaurant.place_name);
      } catch (error) {
        console.error('마커 이미지 생성 오류:', error);
        // 기본 마커 사용
      }

      return marker;
    } catch (error) {
      console.error(`마커 생성 오류: ${restaurant.place_name}`, error);
      return null;
    }
  }, []);

  const closeCurrentOverlay = useCallback(() => {
    if (currentOverlayRef.current) {
      currentOverlayRef.current.setMap(null);
      currentOverlayRef.current = null;
      openedMarkerRef.current = null;

      // 지도 확대/축소 다시 활성화
      if (mapRef.current) {
        mapRef.current.setZoomable(true);
      }
    }
  }, []);

  const closeCurrentClusterOverlay = useCallback(() => {
    if (clusterOverlayRef.current) {
      clusterOverlayRef.current.setMap(null);
      clusterOverlayRef.current = null;

      // 지도 확대/축소 다시 활성화
      if (mapRef.current) {
        mapRef.current.setZoomable(true);
      }
    }
  }, []);

  const handleMarkerClick = useCallback(
    async (index: number, info: Restaurant) => {
      // 같은 마커를 다시 클릭하면 오버레이 닫기
      if (openedMarkerRef.current === index) {
        closeCurrentOverlay();
        return;
      }

      // 기존 오버레이 닫기
      closeCurrentOverlay();

      // 클릭한 마커의 레스토랑 정보로 동적으로 오버레이 생성
      // const restaurant = markersRef.current[index].restaurant;
      const restaurant = (
        await getPlacesWithNameAndBookmarks(userId, [
          markersRef.current[index].restaurant.place_name,
        ])
      )[0];

      const overlay = createMarkerOverlay(restaurant);

      if (overlay) {
        overlay.setMap(mapRef.current);
        currentOverlayRef.current = overlay;
        openedMarkerRef.current = index;

        // DOM 이벤트 리스너 추가 (비동기적으로 처리)
        setTimeout(() => {
          const addEventBtn = document.querySelector('.add-event-btn');
          addEventBtn?.addEventListener('click', () => {
            modalDispatch({ type: 'showModal', payload: info });
          });
        }, 0);
      }
    },
    [modalDispatch, closeCurrentOverlay, createMarkerOverlay],
  );

  const handleMarkerClustererClick = useCallback(
    async (cluster: any) => {
      // 기존 클러스터러 오버레이 닫기
      closeCurrentClusterOverlay();

      // 기존 마커 오버레이도 닫기
      closeCurrentOverlay();

      const overlay = await createClustererOverlay(cluster);
      // overlay.setMap(mapRef.current);

      // // 생성된 오버레이를 참조에 저장
      // clusterOverlayRef.current = overlay;

      // 지도 클릭 시 오버레이 닫기
      kakao.maps.event.addListener(
        mapRef.current,
        'click',
        function clickHandler() {
          closeCurrentClusterOverlay();
          // 이벤트 리스너 한 번만 실행 후 제거
          kakao.maps.event.removeListener(
            mapRef.current,
            'click',
            clickHandler,
          );
        },
      );

      // DOM 이벤트 리스너 추가
      const addEventBtn = document.querySelector('.info-window-container');
      const closeInfoWindowBtn = document.querySelector(
        '.info-window-container .close-btn',
      );

      addEventBtn?.addEventListener('click', (e: any) => {
        if (e.target.classList.contains('add-event-btn')) {
          modalDispatch({
            type: 'showModal',
            payload: JSON.parse(e.target.dataset.restaurant),
          });
        }
      });

      closeInfoWindowBtn?.addEventListener('click', closeCurrentOverlay);
    },
    [
      closeCurrentClusterOverlay,
      closeCurrentOverlay,
      createClustererOverlay,
      modalDispatch,
    ],
  );

  const loadRestaurantsAndCreateMarkers = useCallback(async () => {
    if (!mapRef.current || !markerClustererRef.current) return;

    try {
      // 기존 마커 제거
      markersRef.current.forEach(({ marker }) => {
        marker.setMap(null);
      });

      // 클러스터러에서 모든 마커 제거
      markerClustererRef.current.clear();

      // 데이터 로드
      const restaurants = (await getPlacesWithUserBookmarks(userId)) ?? [];

      // 새 마커 생성 및 추가 (오버레이는 미리 생성하지 않음)
      markersRef.current = restaurants
        .map((restaurant, index) => {
          // 좌표 검증
          const lat = parseFloat(restaurant.latitude ?? '0');
          const lng = parseFloat(restaurant.longitude ?? '0');

          if (lat === 0 || lng === 0 || isNaN(lat) || isNaN(lng)) {
            console.warn(`잘못된 좌표 데이터: ${restaurant.place_name}`, {
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
              parsedLat: lat,
              parsedLng: lng,
            });
          }

          const restaurantInfo: Restaurant = {
            name: restaurant.place_name ?? '',
            tags: (restaurant.category_name ?? '')
              .split('>')
              .filter((elem) => elem !== '음식점'),
            address: restaurant.address_name ?? '',
            period: 0,
            visit: '',
            position: {
              x: restaurant.longitude ?? '', // x는 경도(longitude)
              y: restaurant.latitude ?? '', // y는 위도(latitude)
            },
            place_url: restaurant.place_url ?? '',
          };

          const marker = createMarker(restaurant);

          // 마커가 null이면 건너뛰기
          if (!marker) {
            return null;
          }

          // 클러스터러에 마커 추가
          if (markerClustererRef.current) {
            markerClustererRef.current.addMarker(marker);
          }

          // 마커 클릭 이벤트 추가
          kakao.maps.event.addListener(marker, 'click', () =>
            handleMarkerClick(index, restaurantInfo),
          );

          return { marker, restaurant }; // 오버레이는 제거하고 레스토랑 정보만 저장
        })
        .filter((item) => item !== null) as MapMarker[];

      console.log(`${markersRef.current.length}개 마커 생성 완료`);
    } catch (error) {
      console.error('식당 데이터 로드 및 마커 생성 오류:', error);
    }
  }, [createMarker, handleMarkerClick, userId]);

  // 지도 초기화 함수 - 의존성 최소화
  const initializeMap = useCallback(async () => {
    // 이미 초기화된 경우 중복 실행 방지
    if (isMapInitialized || mapRef.current) {
      console.log('지도가 이미 초기화되어 있습니다.');
      return;
    }

    console.log('지도 초기화 시작');
    const container = document.getElementById('map');
    if (!container) {
      console.error('지도 컨테이너를 찾을 수 없습니다.');
      return;
    }

    const options = {
      center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      level: DEFAULT_ZOOM,
    };

    // 지도 생성
    mapRef.current = new kakao.maps.Map(container, options);

    // 마커 클러스터러 생성 (한 번만 생성)
    if (!markerClustererRef.current) {
      markerClustererRef.current = new kakao.maps.MarkerClusterer({
        map: mapRef.current,
        averageCenter: true,
        minLevel: 1,
        disableClickZoom: true, // 클러스터 마커를 클릭했을 때 지도가 확대되지 않도록 설정한다
      });

      // 클러스터 클릭 이벤트 리스너 추가 (한 번만 추가)
      kakao.maps.event.addListener(
        markerClustererRef.current,
        'clusterclick',
        (cluster: any) => handleMarkerClustererClick(cluster),
      );
    }

    // 지도 클릭 이벤트 (한 번만 추가)
    kakao.maps.event.addListener(mapRef.current, 'click', closeCurrentOverlay);

    // 초기화 상태 업데이트
    console.log('지도 초기화 완료');

    // 식당 데이터 로드 및 마커 생성은 별도 함수로 분리
    await loadRestaurantsAndCreateMarkers();

    setIsMapInitialized(true);
  }, [
    closeCurrentOverlay,
    handleMarkerClustererClick,
    loadRestaurantsAndCreateMarkers,
    isMapInitialized,
  ]);

  // 카카오맵 스크립트 로드 및 초기화 (한 번만 실행)
  useEffect(() => {
    // 앱 초기화가 완료되지 않았으면 지도 초기화하지 않음
    console.log('appInitialized', appInitialized);
    if (!appInitialized) return;

    // 지도가 이미 초기화되었으면 재실행하지 않음
    console.log('isMapInitialized', isMapInitialized, mapRef.current);
    if (isMapInitialized && mapRef.current) return;

    console.log('지도 초기화 시작 (앱 초기화 상태:', appInitialized, ')');

    const loadKakaoMap = () => {
      // 스크립트가 이미 로드된 경우 중복 로드 방지
      if (document.getElementById('kakao-map-script')) {
        if (window.kakao && window.kakao.maps) {
          initializeMap();
        }
        return;
      }

      console.log('카카오맵 스크립트 로드 시작');
      const script = document.createElement('script');
      script.id = 'kakao-map-script';
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_JS_KEY}&libraries=services,clusterer&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => {
          console.log('카카오맵 스크립트 로드 완료');
          initializeMap();
        });
      };
      document.head.appendChild(script);
    };

    // 이미 스크립트가 로드되었는지 확인
    if (window.kakao && window.kakao.maps) {
      console.log('카카오맵 이미 로드됨');
      initializeMap();
    } else {
      loadKakaoMap();
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(({ marker }) => {
          marker.setMap(null);
        });
      }

      if (markerClustererRef.current) {
        markerClustererRef.current.clear();
      }

      // 현재 오버레이도 정리
      if (currentOverlayRef.current) {
        currentOverlayRef.current.setMap(null);
      }
    };
  }, [initializeMap, isMapInitialized, appInitialized]);

  // 식당 데이터나 방문 기록이 변경될 때 마커 업데이트
  useEffect(() => {
    // 지도가 초기화되지 않았거나 로딩 중이면 건너뜀
    if (!isMapInitialized || !mapRef.current || !markerClustererRef.current)
      return;

    // 식당 데이터 업데이트
    loadRestaurantsAndCreateMarkers();
  }, [isMapInitialized, loadRestaurantsAndCreateMarkers]);

  return (
    <>
      <div>
        <div id="map" className="kakao-map" />
      </div>
      <ListModal
        open={showListModal}
        handleClose={() => setShowListModal(false)}
        restaurants={clusterRestaurants}
      />
    </>
  );
};

export default React.memo(Map);
