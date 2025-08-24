import React, { useEffect, useRef, useCallback, useState } from 'react';

import '@components/Map.scss';
import { AppStoreType, Restaurant } from '@src/types';
import { createRoot } from 'react-dom/client';
import {
  getPlacesWithNameAndBookmarks,
  getPlacesWithUserBookmarks,
} from '@lib/api/supabase_api';
import MapCard from '@components/commons/MapCard';
import { useModalDispatch } from '@src/context/ModalContext';
import { useMapInitState } from '@src/context/MapInitContext';
import ListModal from '@components/ListModal';
import {
  useBookMarkActions,
  useBookMarkState,
} from '@src/context/BookMarkContext';
import { convertPlaceToRestaurant } from '@lib/util';
import { PlaceFilter } from '@pages/MainPage';

interface MapMarker {
  marker: kakao.maps.Marker;
  restaurant: any; // 오버레이는 미리 생성하지 않고 레스토랑 정보만 저장
}

const DEFAULT_CENTER = { lat: 37.4028207, lng: 127.1115201 };
const DEFAULT_ZOOM = 3;

interface MapProps extends AppStoreType {
  placeFilter?: PlaceFilter;
  setPlaceFilter?: React.Dispatch<React.SetStateAction<PlaceFilter>>;
}

const Map = ({ state, placeFilter = 'all', setPlaceFilter }: MapProps) => {
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
  const didInitialMarkerLoadRef = useRef<boolean>(false);
  const prevFilterRef = useRef<PlaceFilter | null>(null);
  const prevUserIdRef = useRef<string | null>(null);

  // 필터 옵션 정의
  const filterOptions = [
    {
      value: 'all' as PlaceFilter,
      label: '전체',
      icon: '🌐',
      color: '#666',
    },
    {
      value: 'restaurant' as PlaceFilter,
      label: '음식점',
      icon: '🍽️',
      color: '#FF6B6B',
    },
    {
      value: 'cafe' as PlaceFilter,
      label: '카페',
      icon: '☕',
      color: '#8B4513',
    },
  ];

  // 디버깅용 로그
  console.log('Map component rendered, filter:', placeFilter);

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
    [state.histories],
  );

  const createClustererOverlay = useCallback(
    async (cluster: any) => {
      const markerTitles: string[] = [];
      cluster.getMarkers().forEach((c: any) => {
        const title = c.getTitle();
        if (title) markerTitles.push(title);
      });
      const fetchedRestaurants = await getPlacesWithNameAndBookmarks(
        userId,
        markerTitles,
        placeFilter,
      );
      setClusterRestaurants(fetchedRestaurants);
      setShowListModal(true);
    },
    [state.histories, userId, placeFilter],
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

      await createClustererOverlay(cluster);
      // overlay.setMap(mapRef.current);

      // // 생성된 오버레이를 참조에 저장
      // clusterOverlayRef.current = null;

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

  // 식당 데이터 불러오기 및 마커 생성
  const loadRestaurantsAndCreateMarkers = useCallback(async () => {
    if (!mapRef.current || !markerClustererRef.current) return;

    try {
      // 기존 마커 정리
      markersRef.current.forEach(({ marker }) => {
        marker.setMap(null);
      });
      markersRef.current = [];
      markerClustererRef.current.clear();

      // 식당 데이터 가져오기 (필터 적용)
      const restaurants = await getPlacesWithUserBookmarks(userId, placeFilter);
      console.log(
        `총 ${restaurants.length}개의 장소 로드 (필터: ${placeFilter})`,
      );

      // 각 식당에 대해 마커 생성
      const newMarkers: kakao.maps.Marker[] = [];
      restaurants.forEach((restaurant: any) => {
        const marker = createMarker(restaurant);
        if (marker) {
          markersRef.current.push({ marker, restaurant });
          newMarkers.push(marker);

          // 마커 클릭 이벤트
          kakao.maps.event.addListener(marker, 'click', () => {
            // 기존 오버레이 닫기
            closeCurrentOverlay();

            // 새 오버레이 생성 및 표시
            const overlay = createMarkerOverlay(restaurant);
            if (overlay) {
              overlay.setMap(mapRef.current);
              currentOverlayRef.current = overlay;
            }
          });
        }
      });

      // 클러스터러에 마커 추가
      markerClustererRef.current.addMarkers(newMarkers);
    } catch (error) {
      console.error('식당 데이터 로드 오류:', error);
    }
  }, [
    createMarker,
    createMarkerOverlay,
    closeCurrentOverlay,
    userId,
    placeFilter,
  ]);

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

    // 지도 초기화 완료 플래그만 설정하고,
    // 실제 마커 로딩은 아래 useEffect에서 한 번만 수행
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

  // 초기 1회 + 필터/사용자 변경 시에만 마커 업데이트
  useEffect(() => {
    if (!isMapInitialized || !mapRef.current || !markerClustererRef.current)
      return;

    const isInitialLoad = !didInitialMarkerLoadRef.current;
    const isFilterChanged = prevFilterRef.current !== placeFilter;
    const isUserChanged = prevUserIdRef.current !== userId;

    if (isInitialLoad || isFilterChanged || isUserChanged) {
      didInitialMarkerLoadRef.current = true;
      prevFilterRef.current = placeFilter;
      prevUserIdRef.current = userId as any;
      loadRestaurantsAndCreateMarkers();
    }
  }, [isMapInitialized, placeFilter, userId, loadRestaurantsAndCreateMarkers]);

  // 검색에서 온 선택 항목 처리: 지도 이동 + 최대 확대 + 오버레이 표시
  useEffect(() => {
    const handler = (e: any) => {
      if (!mapRef.current) return;
      const place = e.detail;
      const lat = parseFloat(place.latitude ?? place.y ?? '0');
      const lng = parseFloat(place.longitude ?? place.x ?? '0');
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

      const pos = new kakao.maps.LatLng(lat, lng);
      mapRef.current.setCenter(pos);
      mapRef.current.setLevel(1); // 최대 확대에 가깝게

      // 오버레이 생성 및 표시
      const overlay = createMarkerOverlay({
        ...place,
        latitude: String(lat),
        longitude: String(lng),
      });
      if (overlay) {
        overlay.setMap(mapRef.current);
        currentOverlayRef.current?.setMap(null);
        currentOverlayRef.current = overlay;

        // 오버레이 내부 버튼('오늘은 이거다') 클릭 시 모달 표시 및 오버레이 닫기
        setTimeout(() => {
          const btn = document.querySelector('.add-event-btn');
          btn?.addEventListener('click', () => {
            try {
              const converted = convertPlaceToRestaurant({
                id: place.id,
                place_name: place.place_name,
                address_name: place.address_name,
                road_address_name: place.road_address_name,
                category_name: place.category_name,
                place_url: place.place_url,
                x: String(lng),
                y: String(lat),
                distance: place.distance,
              } as any);
              modalDispatch({ type: 'showModal', payload: converted });
            } finally {
              // 줌 비활성화가 남지 않도록 안전하게 오버레이 닫기 (zoomable 되살림)
              closeCurrentOverlay();
            }
          });
        }, 0);
      }
    };

    window.addEventListener('openPlaceFromSearch', handler as EventListener);
    return () =>
      window.removeEventListener(
        'openPlaceFromSearch',
        handler as EventListener,
      );
  }, [createMarkerOverlay, modalDispatch, closeCurrentOverlay]);

  return (
    <>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div id="map" className="kakao-map" />
      </div>

      {/* 플로팅 필터 버튼 - 툴바 바로 아래 오른쪽 */}
      <div
        style={{
          position: 'fixed',
          top: '80px',
          right: '16px',
          display: 'flex',
          gap: '8px',
          zIndex: 1200, // 모달(1300) 아래, 지도(기본 0) 위
          backgroundColor: 'white',
          borderRadius: '25px',
          padding: '4px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
        }}
      >
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              console.log('Filter clicked:', option.value);
              setPlaceFilter?.(option.value);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              backgroundColor:
                placeFilter === option.value ? option.color : 'white',
              color: placeFilter === option.value ? 'white' : option.color,
              border: `1px solid ${option.color}`,
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: placeFilter === option.value ? 'bold' : 'normal',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              if (placeFilter !== option.value) {
                e.currentTarget.style.backgroundColor = `${option.color}20`;
              }
            }}
            onMouseLeave={(e) => {
              if (placeFilter !== option.value) {
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
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
