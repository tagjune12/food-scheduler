import React, { useEffect, useRef, useCallback, useState } from 'react';
import { AppStoreType, Restaurant } from '@src/types';
import { createRoot } from 'react-dom/client';
import {
  getPlacesWithNameAndBookmarks,
  getPlacesWithUserBookmarks,
} from '@lib/api/supabase_api';
import MapCard from '@components/commons/MapCard';
import { useModalDispatch } from '@src/context/ModalContext';
import { useMapInitState } from '@src/context/MapInitContext';
import {
  useBookMarkActions,
  useBookMarkState,
} from '@src/context/BookMarkContext';
import { convertPlaceToRestaurant } from '@lib/util';
import { PlaceFilter } from '@pages/MainPage';

// Presentational 컴포넌트 Import
import Map, { FilterOption } from './Map';

interface MapMarker {
  marker: kakao.maps.Marker;
  restaurant: any;
}

const DEFAULT_CENTER = { lat: 37.4028207, lng: 127.1115201 };
const DEFAULT_ZOOM = 5;

interface MapContainerProps extends AppStoreType {
  placeFilter?: PlaceFilter;
  setPlaceFilter?: React.Dispatch<React.SetStateAction<PlaceFilter>>;
}

const MapContainer = ({ state, placeFilter = 'all', setPlaceFilter }: MapContainerProps) => {
  const modalDispatch = useModalDispatch();
  const { initialized: appInitialized } = useMapInitState();
  const { addBookmark, removeBookmark } = useBookMarkActions();

  // 지도의 각종 상태 데이터 및 Ref 의존성 정의
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const openedMarkerRef = useRef<number | null>(null);
  const markerClustererRef = useRef<kakao.maps.MarkerClusterer | null>(null);
  const clusterOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const currentOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState<boolean>(false);
  const [showListModal, setShowListModal] = useState<boolean>(false);
  const [clusterRestaurants, setClusterRestaurants] = useState<any[]>([]);
  const { userId } = useBookMarkState();
  
  const didInitialMarkerLoadRef = useRef<boolean>(false);
  const prevFilterRef = useRef<PlaceFilter | null>(null);
  const prevUserIdRef = useRef<string | null>(null);

  // Presentational 에 전달될 필터 옵션
  const filterOptions: FilterOption[] = [
    { value: 'all', label: '전체', icon: '🌐', color: '#666' },
    { value: 'restaurant', label: '음식점', icon: '🍽️', color: '#FF6B6B' },
    { value: 'cafe', label: '카페', icon: '☕', color: '#8B4513' },
  ];

  const createMarkerOverlay = useCallback(
    (restaurant: any) => {
      const content = document.createElement('div');
      const root = document.createElement('div');
      content.appendChild(root);

      const lat = parseFloat(restaurant.latitude ?? '0');
      const lng = parseFloat(restaurant.longitude ?? '0');

      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(lat, lng),
        content,
        yAnchor: 1,
        clickable: true,
      });

      const infoWindow = document.createElement('div');
      root.appendChild(infoWindow);

      infoWindow.addEventListener('wheel', (e) => {
        e.stopPropagation();
        e.preventDefault();
      }, { passive: false });

      infoWindow.addEventListener('mouseenter', () => mapRef.current?.setZoomable(false));
      infoWindow.addEventListener('mouseleave', () => mapRef.current?.setZoomable(true));

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
    [state.histories, addBookmark, removeBookmark],
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
    [userId, placeFilter],
  );

  const createMarker = useCallback((restaurant: any) => {
    try {
      const lat = parseFloat(restaurant.latitude ?? '0');
      const lng = parseFloat(restaurant.longitude ?? '0');

      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(lat, lng),
        map: mapRef.current ?? undefined,
      });

      try {
        const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
        const markerImage = new kakao.maps.MarkerImage(
          imageSrc,
          new kakao.maps.Size(20, 20),
          { offset: new kakao.maps.Point(15, 15) }
        );
        marker.setImage(markerImage);
        marker.setTitle(restaurant.place_name);
      } catch (error) {}

      return marker;
    } catch (error) {
      return null;
    }
  }, []);

  const closeCurrentOverlay = useCallback(() => {
    if (currentOverlayRef.current) {
      currentOverlayRef.current.setMap(null);
      currentOverlayRef.current = null;
      openedMarkerRef.current = null;
      mapRef.current?.setZoomable(true);
    }
  }, []);

  const closeCurrentClusterOverlay = useCallback(() => {
    if (clusterOverlayRef.current) {
      clusterOverlayRef.current.setMap(null);
      clusterOverlayRef.current = null;
      mapRef.current?.setZoomable(true);
    }
  }, []);

  const handleMarkerClustererClick = useCallback(
    async (cluster: any) => {
      closeCurrentClusterOverlay();
      closeCurrentOverlay();

      await createClustererOverlay(cluster);

      if (mapRef.current) {
        kakao.maps.event.addListener(
          mapRef.current,
          'click',
          function clickHandler() {
            closeCurrentClusterOverlay();
            if (mapRef.current) {
              kakao.maps.event.removeListener(mapRef.current, 'click', clickHandler);
            }
          },
        );
      }

      const addEventBtn = document.querySelector('.info-window-container');
      const closeInfoWindowBtn = document.querySelector('.info-window-container .close-btn');

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
    [closeCurrentClusterOverlay, closeCurrentOverlay, createClustererOverlay, modalDispatch],
  );

  const loadRestaurantsAndCreateMarkers = useCallback(async () => {
    if (!mapRef.current || !markerClustererRef.current) return;

    try {
      markersRef.current.forEach(({ marker }) => marker.setMap(null));
      markersRef.current = [];
      markerClustererRef.current.clear();

      const restaurants = await getPlacesWithUserBookmarks(userId, placeFilter);
      const newMarkers: kakao.maps.Marker[] = [];
      
      restaurants.forEach((restaurant: any) => {
        const marker = createMarker(restaurant);
        if (marker) {
          markersRef.current.push({ marker, restaurant });
          newMarkers.push(marker);

          kakao.maps.event.addListener(marker, 'click', () => {
            closeCurrentOverlay();
            const overlay = createMarkerOverlay(restaurant);
            if (overlay) {
              overlay.setMap(mapRef.current);
              currentOverlayRef.current = overlay;
            }
          });
        }
      });

      markerClustererRef.current.addMarkers(newMarkers);
    } catch (error) {
      console.error('식당 데이터 로드 오류:', error);
    }
  }, [createMarker, createMarkerOverlay, closeCurrentOverlay, userId, placeFilter]);

  const initializeMap = useCallback(async () => {
    if (isMapInitialized || mapRef.current) return;

    const container = document.getElementById('map');
    if (!container) return;

    mapRef.current = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      level: DEFAULT_ZOOM,
    });

    if (!markerClustererRef.current) {
      markerClustererRef.current = new kakao.maps.MarkerClusterer({
        map: mapRef.current,
        averageCenter: true,
        minLevel: 1,
        disableClickZoom: true,
      });

      kakao.maps.event.addListener(
        markerClustererRef.current,
        'clusterclick',
        (cluster: any) => handleMarkerClustererClick(cluster)
      );
    }

    kakao.maps.event.addListener(mapRef.current, 'click', closeCurrentOverlay);
    setIsMapInitialized(true);
  }, [closeCurrentOverlay, handleMarkerClustererClick, isMapInitialized]);

  useEffect(() => {
    if (!appInitialized) return;
    if (isMapInitialized && mapRef.current) return;

    const loadKakaoMap = () => {
      if (document.getElementById('kakao-map-script')) {
        if (window.kakao && window.kakao.maps) initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.id = 'kakao-map-script';
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_JS_KEY}&libraries=services,clusterer&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => initializeMap());
      };
      document.head.appendChild(script);
    };

    if (window.kakao && window.kakao.maps) {
      initializeMap();
    } else {
      loadKakaoMap();
    }

    return () => {
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(({ marker }) => marker.setMap(null));
      }
      markerClustererRef.current?.clear();
      currentOverlayRef.current?.setMap(null);
    };
  }, [initializeMap, isMapInitialized, appInitialized]);

  useEffect(() => {
    if (!isMapInitialized || !mapRef.current || !markerClustererRef.current) return;

    const isInitialLoad = !didInitialMarkerLoadRef.current;
    if (isInitialLoad || prevFilterRef.current !== placeFilter || prevUserIdRef.current !== userId) {
      didInitialMarkerLoadRef.current = true;
      prevFilterRef.current = placeFilter;
      prevUserIdRef.current = userId as any;
      loadRestaurantsAndCreateMarkers();
    }
  }, [isMapInitialized, placeFilter, userId, loadRestaurantsAndCreateMarkers]);

  useEffect(() => {
    const handler = (e: any) => {
      if (!mapRef.current) return;
      const place = e.detail;
      const lat = parseFloat(place.latitude ?? place.y ?? '0');
      const lng = parseFloat(place.longitude ?? place.x ?? '0');
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

      const pos = new kakao.maps.LatLng(lat, lng);
      mapRef.current.setCenter(pos);
      mapRef.current.setLevel(1);

      const overlay = createMarkerOverlay({ ...place, latitude: String(lat), longitude: String(lng) });
      if (overlay) {
        overlay.setMap(mapRef.current);
        currentOverlayRef.current?.setMap(null);
        currentOverlayRef.current = overlay;

        setTimeout(() => {
          document.querySelector('.add-event-btn')?.addEventListener('click', () => {
            try {
              modalDispatch({
                type: 'showModal',
                payload: convertPlaceToRestaurant({
                  ...place, x: String(lng), y: String(lat)
                } as any)
              });
            } finally {
              closeCurrentOverlay();
            }
          });
        }, 0);
      }
    };

    window.addEventListener('openPlaceFromSearch', handler as EventListener);
    return () => window.removeEventListener('openPlaceFromSearch', handler as EventListener);
  }, [createMarkerOverlay, modalDispatch, closeCurrentOverlay]);

  return (
    <Map
      placeFilter={placeFilter}
      onFilterChange={(filter) => setPlaceFilter?.(filter)}
      filterOptions={filterOptions}
      showListModal={showListModal}
      onCloseListModal={() => setShowListModal(false)}
      clusterRestaurants={clusterRestaurants}
    />
  );
};

export default React.memo(MapContainer);
