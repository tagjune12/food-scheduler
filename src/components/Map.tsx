import React, { useContext, useEffect, useRef, useCallback } from 'react';
// import restaurants from '@data/restaurants.json';
import RestaurantCard from '@components/commons/RestaurantCard';
import '@components/Map.scss';
import { UseDispatch } from '@src/App';
import { AppStoreType, Restaurant } from '@src/types';
import { createRoot } from 'react-dom/client';
import { searchLocalPlaces } from '@lib/api/kakao_api';
import qs from 'qs';

interface MapMarker {
  marker: kakao.maps.Marker;
  overlay: kakao.maps.CustomOverlay;
}

interface MarkerStyle {
  width: string;
  height: string;
  backgroundColor: string;
}

const DEFAULT_CENTER = { lat: 37.4028207, lng: 127.1115201 };
const DEFAULT_ZOOM = 3;

const MARKER_STYLE: MarkerStyle = {
  width: '20px',
  height: '20px',
  backgroundColor: '#845EC2',
};

const Map = ({ state }: AppStoreType) => {
  const dispatch = useContext(UseDispatch);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const openedMarkerRef = useRef<number | null>(null);

  const createOverlay = useCallback(
    (restaurant: kakao.maps.services.PlacesSearchResult) => {
      const content = document.createElement('div');
      const root = document.createElement('div');
      content.appendChild(root);

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(
          parseFloat(restaurant.y ?? '0'),
          parseFloat(restaurant.x ?? '0'),
        ),
        content,
        yAnchor: 1,
        clickable: true,
      });

      // React 컴포넌트를 렌더링
      const infoWindow = document.createElement('div');
      root.appendChild(infoWindow);

      const card = document.createElement('div');
      infoWindow.appendChild(card);

      const cardContainer = createRoot(card);
      const cardContent = (
        <RestaurantCard
          restaurant={restaurant}
          onMap={true}
          visitDate={state.histories[restaurant.place_name]?.date}
        />
      );
      cardContainer.render(cardContent);
      // card.appendChild(cardContent);

      return overlay;
    },
    [state.histories],
  );

  const createMarker = useCallback(
    (position: kakao.maps.LatLng) => {
      const marker = new kakao.maps.Marker({
        position,
        map: mapRef.current ?? undefined,
      });

      // 커스텀 이미지 설정
      try {
        // const markerContent = createMarkerContent();
        // const sanitizedContent = encodeURIComponent(markerContent);
        // const imageSrc = 'data:image/svg+xml;charset=utf-8,' + sanitizedContent;
        const imageSrc =
          'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';

        const imageSize = new kakao.maps.Size(30, 30); // 더 큰 크기로 조정
        const imageOption = { offset: new kakao.maps.Point(15, 15) }; // 중심점 조정
        const markerImage = new kakao.maps.MarkerImage(
          imageSrc,
          imageSize,
          imageOption,
        );
        marker.setImage(markerImage);
      } catch (error) {
        console.error('마커 이미지 생성 오류:', error);
        // 기본 마커 사용
      }

      return marker;
    },
    // [createMarkerContent],
    [],
  );

  const closeCurrentOverlay = useCallback(() => {
    if (openedMarkerRef.current !== null) {
      markersRef.current[openedMarkerRef.current].overlay.setMap(null);
      openedMarkerRef.current = null;
    }
  }, []);

  const handleMarkerClick = useCallback(
    (index: number, info: Restaurant) => {
      const { overlay } = markersRef.current[index];

      if (openedMarkerRef.current === index) {
        overlay.setMap(null);
        openedMarkerRef.current = null;
        return;
      }

      closeCurrentOverlay();
      overlay.setMap(mapRef.current);
      openedMarkerRef.current = index;

      // DOM 이벤트 리스너 추가
      const addEventBtn = document.querySelector('.add-event-btn');
      const closeInfoWindowBtn = document.querySelector(
        '.info-window-container .close-btn',
      );

      addEventBtn?.addEventListener('click', () => {
        dispatch({ type: 'showModal', payload: info });
      });

      closeInfoWindowBtn?.addEventListener('click', closeCurrentOverlay);
    },
    [dispatch, closeCurrentOverlay],
  );

  const initializeMap = useCallback(async () => {
    const container = document.getElementById('map');
    if (!container) return;

    const options = {
      center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      level: DEFAULT_ZOOM,
    };

    // 지도 생성
    mapRef.current = new kakao.maps.Map(container, options);

    // 카카오맵 카테고리 검색으로 식당 가져오기
    const params = qs.stringify({
      category_group_code: 'FD6',
      x: DEFAULT_CENTER.lng,
      y: DEFAULT_CENTER.lat,
      radius: 1500,
      page: 1,
    });

    const restaurants = await searchLocalPlaces(params);

    markersRef.current = restaurants.documents.map((restaurant, index) => {
      const position = new kakao.maps.LatLng(
        parseFloat(restaurant.y ?? '0'),
        parseFloat(restaurant.x ?? '0'),
      );

      const restaurantInfo: Restaurant = {
        name: restaurant.place_name,
        tags: restaurant.category_name
          .split('>')
          .filter((elem) => elem !== '음식점'),
        address: restaurant.address_name,
        period: 0,
        visit: '',
        position: {
          x: restaurant.x,
          y: restaurant.y,
        },
        place_url: restaurant.place_url,
      };

      const marker = createMarker(position);
      const overlay = createOverlay(restaurant);

      kakao.maps.event.addListener(marker, 'click', () =>
        handleMarkerClick(index, restaurantInfo),
      );

      return { marker, overlay };
    });

    // 지도 클릭 이벤트
    kakao.maps.event.addListener(mapRef.current, 'click', closeCurrentOverlay);
  }, [createMarker, createOverlay, handleMarkerClick, closeCurrentOverlay]);

  useEffect(() => {
    const loadKakaoMap = () => {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_JS_KEY}&libraries=services&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => {
          initializeMap();
        });
      };
      document.head.appendChild(script);
    };

    if (window.kakao && window.kakao.maps) {
      initializeMap();
    } else {
      loadKakaoMap();
    }

    return () => {
      markersRef.current.forEach(({ marker, overlay }) => {
        marker.setMap(null);
        overlay.setMap(null);
      });
    };
  }, [initializeMap]);

  return (
    <div>
      <div id="map" className="kakao-map" />
    </div>
  );
};

export default Map;
