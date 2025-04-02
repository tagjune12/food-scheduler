import React, {
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';
// import restaurants from '@data/restaurants.json';
import RestaurantCard from '@components/commons/RestaurantCard';
import '@components/Map.scss';
import { UseDispatch } from '@src/App';
import { AppStoreType, Restaurant } from '@src/types';
import { createRoot } from 'react-dom/client';
import { searchLocalPlaces } from '@lib/api/kakao_api';
import qs from 'qs';
import { getRestaurants, getRestaurantsWithName } from '@lib/api/supabase_api';

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
  const markerClustererRef = useRef<kakao.maps.MarkerClusterer | null>(null);
  const clusterOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

  const createOverlay = useCallback(
    (restaurant: any) => {
      const content = document.createElement('div');
      const root = document.createElement('div');
      content.appendChild(root);

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(
          parseFloat(restaurant.longitude ?? '0'),
          parseFloat(restaurant.latitude ?? '0'),
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

      return overlay;
    },
    [state.histories],
  );

  const createOverlay2 = useCallback(
    async (cluster: any) => {
      const content = document.createElement('div');
      content.className = 'cluster-overlay';

      const root = document.createElement('div');
      content.appendChild(root);

      const overlay = new kakao.maps.CustomOverlay({
        position: cluster.getCenter(),
        content,
        yAnchor: 1.2,
        clickable: true,
      });

      // React 컴포넌트를 렌더링
      const infoWindow = document.createElement('div');
      infoWindow.className = 'info-window-container';
      root.appendChild(infoWindow);

      // 닫기 버튼 추가
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.textContent = '닫기';
      closeBtn.onclick = () => {
        // 현재 오버레이를 닫음
        overlay.setMap(null);
        if (clusterOverlayRef.current === overlay) {
          clusterOverlayRef.current = null;
        }
      };
      infoWindow.appendChild(closeBtn);

      const card = document.createElement('div');
      card.className = 'cluster-card-container';
      infoWindow.appendChild(card);

      // 클러스터에 포함된 마커 이름 가져오기
      const markerTitles: string[] = [];
      cluster.getMarkers().forEach((c: any) => {
        const title = c.getTitle();
        if (title) markerTitles.push(title);
      });

      const restaurants = await getRestaurantsWithName(markerTitles);

      const cardContainer = createRoot(card);
      const cardContent = (
        <div className="cluster-restaurants">
          <h3>{restaurants.length}개의 식당</h3>
          {restaurants.map((restaurant, idx) => (
            <RestaurantCard
              key={idx}
              restaurant={restaurant}
              onMap={true}
              visitDate={
                restaurant.place_name
                  ? state.histories[restaurant.place_name]?.date
                  : undefined
              }
            />
          ))}
        </div>
      );
      cardContainer.render(cardContent);

      return overlay;
    },
    [state.histories],
  );

  const createMarker = useCallback(
    (restaurant: any) => {
      const position = new kakao.maps.LatLng(
        parseFloat(restaurant.longitude ?? '0'), // y
        parseFloat(restaurant.latitude ?? '0'), // x
      );
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

        const imageSize = new kakao.maps.Size(20, 20); // 더 큰 크기로 조정
        const imageOption = { offset: new kakao.maps.Point(15, 15) }; // 중심점 조정
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

  const closeCurrentClusterOverlay = useCallback(() => {
    if (clusterOverlayRef.current) {
      clusterOverlayRef.current.setMap(null);
      clusterOverlayRef.current = null;
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

  const handleMarkerClustererClick = useCallback(
    async (cluster: any) => {
      console.log(cluster.getSize());
      // 기존 클러스터러 오버레이 닫기
      closeCurrentClusterOverlay();

      // 기존 마커 오버레이도 닫기
      closeCurrentOverlay();

      const overlay = await createOverlay2(cluster);
      overlay.setMap(mapRef.current);

      // 생성된 오버레이를 참조에 저장
      clusterOverlayRef.current = overlay;

      // 지도 클릭 시 오버레이 닫기
      const clickListener = kakao.maps.event.addListener(
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
    },
    [closeCurrentClusterOverlay, closeCurrentOverlay, createOverlay2],
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

    // 마커 클러스터러 생성
    markerClustererRef.current = new kakao.maps.MarkerClusterer({
      map: mapRef.current,
      averageCenter: true,
      minLevel: 1,
      disableClickZoom: true, // 클러스터 마커를 클릭했을 때 지도가 확대되지 않도록 설정한다
    });

    // 클러스터 클릭 이벤트 리스너 추가
    kakao.maps.event.addListener(
      markerClustererRef.current,
      'clusterclick',
      (cluster: any) => handleMarkerClustererClick(cluster),
    );

    // // 카카오맵 카테고리 검색으로 식당 가져오기
    // const params = qs.stringify({
    //   category_group_code: 'FD6',
    //   x: DEFAULT_CENTER.lng,
    //   y: DEFAULT_CENTER.lat,
    //   radius: 1500,
    //   page: 1,
    // });

    // const restaurants = await searchLocalPlaces(params);
    const restaurants = (await getRestaurants()) ?? [];

    markersRef.current = restaurants.map((restaurant, index) => {
      const position = new kakao.maps.LatLng(
        parseFloat(restaurant.longitude ?? '0'), // y
        parseFloat(restaurant.latitude ?? '0'), // x
      );
      const restaurantInfo: Restaurant = {
        name: restaurant.place_name ?? '',
        tags: (restaurant.category_name ?? '')
          .split('>')
          .filter((elem) => elem !== '음식점'),
        address: restaurant.address_name ?? '',
        period: 0,
        visit: '',
        position: {
          x: restaurant.latitude ?? '',
          y: restaurant.longitude ?? '',
        },
        place_url: restaurant.place_url ?? '',
      };

      const marker = createMarker(restaurant);
      const overlay = createOverlay(restaurant);

      markerClustererRef.current?.addMarker(marker);

      kakao.maps.event.addListener(marker, 'click', () =>
        handleMarkerClick(index, restaurantInfo),
      );

      return { marker, overlay };
    });

    // 지도 클릭 이벤트
    kakao.maps.event.addListener(mapRef.current, 'click', closeCurrentOverlay);
  }, [
    createMarker,
    createOverlay,
    handleMarkerClick,
    handleMarkerClustererClick,
    closeCurrentOverlay,
  ]);

  useEffect(() => {
    const loadKakaoMap = () => {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_JS_KEY}&libraries=services,clusterer&autoload=false`;
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
