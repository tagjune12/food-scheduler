import React, {
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';

import '@components/Map.scss';
import { UseDispatch, MapInitContext } from '@src/App';
import { AppStoreType, Restaurant } from '@src/types';
import { createRoot } from 'react-dom/client';
import { getRestaurants, getRestaurantsWithName } from '@lib/api/supabase_api';
import MapCard from './commons/MapCard';
import Fab from '@mui/material/Fab';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

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
  const { initialized: appInitialized } = useContext(MapInitContext);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const openedMarkerRef = useRef<number | null>(null);
  const markerClustererRef = useRef<kakao.maps.MarkerClusterer | null>(null);
  const clusterOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState<boolean>(false);

  const createMarkerOverlay = useCallback(
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
        />
      );
      cardContainer.render(cardContent);

      return overlay;
    },
    [state.histories],
  );

  const createClustererOverlay = useCallback(
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

      // 마우스 휠 이벤트 중지
      infoWindow.addEventListener(
        'wheel',
        (e) => {
          e.stopPropagation();
          e.preventDefault();
        },
        { passive: false },
      );

      // 마우스 드래그 스크롤 기능 추가
      let isDragging = false;
      let startY = 0;
      let startScrollTop = 0;

      // 마우스 다운 - 드래그 시작
      infoWindow.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        startScrollTop = infoWindow.scrollTop;
        infoWindow.style.cursor = 'grabbing';
        infoWindow.classList.add('dragging');
      });

      // 마우스 이동 - 드래그 중
      infoWindow.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const deltaY = e.clientY - startY;
        infoWindow.scrollTop = startScrollTop - deltaY;
      });

      // 마우스 업 - 드래그 종료
      const mouseUpHandler = () => {
        if (isDragging) {
          isDragging = false;
          infoWindow.style.cursor = 'grab';
          infoWindow.classList.remove('dragging');
        }
      };

      window.addEventListener('mouseup', mouseUpHandler);

      // 마우스 리브 - 드래그 종료
      infoWindow.addEventListener('mouseleave', () => {
        if (isDragging) {
          isDragging = false;
          infoWindow.style.cursor = 'grab';
          infoWindow.classList.remove('dragging');
        }
      });

      // 오버레이가 닫힐 때 이벤트 리스너 정리
      kakao.maps.event.addListener(overlay, 'remove', function () {
        window.removeEventListener('mouseup', mouseUpHandler);
      });

      // 초기 커서 스타일 설정
      infoWindow.style.cursor = 'grab';

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

      // 지도 클릭 시 오버레이 닫기
      kakao.maps.event.addListener(
        mapRef.current,
        'click',
        function clickHandler2() {
          // 현재 오버레이를 닫음
          overlay.setMap(null);
          if (clusterOverlayRef.current === overlay) {
            clusterOverlayRef.current = null;
          }

          // 지도 확대/축소 다시 활성화
          if (mapRef.current) {
            mapRef.current.setZoomable(true);
          }

          // 이벤트 리스너 한 번만 실행 후 제거
          kakao.maps.event.removeListener(
            mapRef.current,
            'click',
            clickHandler2,
          );
        },
      );

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
        <div
          className="cluster-restaurants"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {/* <h3>{restaurants.length}개의 식당</h3> */}
          {restaurants.map((restaurant, idx) => (
            <MapCard
              key={idx}
              restaurant={restaurant}
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

      // 스크롤 버튼 추가
      const scrollBtnsContainer = document.createElement('div');
      scrollBtnsContainer.className = 'scroll-buttons';

      // 위로 스크롤 버튼
      // const scrollUpBtn = document.createElement('button');
      // scrollUpBtn.className = 'scroll-btn scroll-up';
      // scrollUpBtn.textContent = '↑ 위로';
      // scrollUpBtn.setAttribute('aria-label', '위로 스크롤');
      const scrollUpBtn = document.createElement('div');
      const scrollUpBtnRoot = createRoot(scrollUpBtn);
      const scrollUpBtnContent = (
        <Fab className="scroll-btn scroll-up" aria-label="위로 스크롤">
          <ArrowDropUpIcon />
        </Fab>
      );
      scrollUpBtnRoot.render(scrollUpBtnContent);

      // 아래로 스크롤 버튼
      // const scrollDownBtn = document.createElement('button');
      // scrollDownBtn.className = 'scroll-btn scroll-down';
      // scrollDownBtn.textContent = '↓ 아래로';
      // scrollDownBtn.setAttribute('aria-label', '아래로 스크롤');

      const scrollDownBtn = document.createElement('div');
      const scrollDownBtnRoot = createRoot(scrollDownBtn);
      const scrollDownBtnContent = (
        <Fab className="scroll-btn scroll-down" aria-label="아래로 스크롤">
          <ArrowDropDownIcon />
        </Fab>
      );
      scrollDownBtnRoot.render(scrollDownBtnContent);

      // 버튼 컨테이너에 추가
      scrollBtnsContainer.appendChild(scrollUpBtn);
      scrollBtnsContainer.appendChild(scrollDownBtn);

      // 정보창에 버튼 컨테이너 추가
      infoWindow.appendChild(scrollBtnsContainer);

      // 한 번에 스크롤할 크기 계산 함수
      const calculateScrollAmount = () => {
        // 카드 요소들 가져오기
        const cardElements = infoWindow.querySelectorAll('.card-container');

        if (cardElements.length === 0) return 0;

        // 카드 요소의 높이 (마진 포함)
        const cardHeight = cardElements[0].getBoundingClientRect().height + 15; // 15px는 margin-bottom

        // 아이템 3개에 해당하는 높이 반환
        return cardHeight * 3;
      };

      // 스크롤 버튼 활성화/비활성화 상태 업데이트
      const updateScrollBtns = () => {
        // 스크롤이 최상단에 있으면 위로 버튼 비활성화
        if (infoWindow.scrollTop <= 0) {
          scrollUpBtn.classList.add('disabled');
        } else {
          scrollUpBtn.classList.remove('disabled');
        }

        // 스크롤이 최하단에 있으면 아래로 버튼 비활성화
        const maxScrollTop = infoWindow.scrollHeight - infoWindow.clientHeight;
        if (infoWindow.scrollTop >= maxScrollTop - 5) {
          // 5px 오차 허용
          scrollDownBtn.classList.add('disabled');
        } else {
          scrollDownBtn.classList.remove('disabled');
        }
      };

      // 스크롤 이벤트에 맞춰 버튼 상태 업데이트
      infoWindow.addEventListener('scroll', updateScrollBtns);

      // 위로 스크롤 버튼 클릭 이벤트
      scrollUpBtn.addEventListener('click', () => {
        const scrollAmount = calculateScrollAmount();
        infoWindow.scrollBy({
          top: -scrollAmount,
          behavior: 'smooth',
        });
      });

      // 아래로 스크롤 버튼 클릭 이벤트
      scrollDownBtn.addEventListener('click', () => {
        const scrollAmount = calculateScrollAmount();
        infoWindow.scrollBy({
          top: scrollAmount,
          behavior: 'smooth',
        });
      });

      // 초기 버튼 상태 설정
      setTimeout(updateScrollBtns, 100); // 컨텐츠 렌더링 후 상태 업데이트

      // 오버레이가 닫힐 때 추가 이벤트 정리
      kakao.maps.event.addListener(overlay, 'remove', function () {
        infoWindow.removeEventListener('scroll', updateScrollBtns);
      });

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
      // const closeInfoWindowBtn = document.querySelector(
      //   '.info-window-container .close-btn',
      // );

      addEventBtn?.addEventListener('click', () => {
        dispatch({ type: 'showModal', payload: info });
      });

      // closeInfoWindowBtn?.addEventListener('click', closeCurrentOverlay);
    },
    [dispatch, closeCurrentOverlay],
  );

  const handleMarkerClustererClick = useCallback(
    async (cluster: any) => {
      // 기존 클러스터러 오버레이 닫기
      closeCurrentClusterOverlay();

      // 기존 마커 오버레이도 닫기
      closeCurrentOverlay();

      const overlay = await createClustererOverlay(cluster);
      overlay.setMap(mapRef.current);

      // 생성된 오버레이를 참조에 저장
      clusterOverlayRef.current = overlay;

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
          dispatch({
            type: 'showModal',
            payload: JSON.parse(e.target.dataset.restaurant),
          });
        }
      });

      closeInfoWindowBtn?.addEventListener('click', closeCurrentOverlay);
    },
    [closeCurrentClusterOverlay, closeCurrentOverlay, createClustererOverlay],
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
      const restaurants = (await getRestaurants()) ?? [];

      // 새 마커 생성 및 추가
      markersRef.current = restaurants.map((restaurant, index) => {
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
        const overlay = createMarkerOverlay(restaurant);

        // 클러스터러에 마커 추가
        markerClustererRef.current?.addMarker(marker);

        // 마커 클릭 이벤트 추가
        kakao.maps.event.addListener(marker, 'click', () =>
          handleMarkerClick(index, restaurantInfo),
        );

        return { marker, overlay };
      });

      console.log(`${markersRef.current.length}개 마커 생성 완료`);
    } catch (error) {
      console.error('식당 데이터 로드 및 마커 생성 오류:', error);
    }
  }, [createMarker, createMarkerOverlay, handleMarkerClick]);

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
    setIsMapInitialized(true);
    console.log('지도 초기화 완료');

    // 식당 데이터 로드 및 마커 생성은 별도 함수로 분리
    await loadRestaurantsAndCreateMarkers();
  }, [
    closeCurrentOverlay,
    handleMarkerClustererClick,
    loadRestaurantsAndCreateMarkers,
    isMapInitialized,
  ]);

  // 카카오맵 스크립트 로드 및 초기화 (한 번만 실행)
  useEffect(() => {
    // 앱 초기화가 완료되지 않았으면 지도 초기화하지 않음
    if (!appInitialized) return;

    // 지도가 이미 초기화되었으면 재실행하지 않음
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
        markersRef.current.forEach(({ marker, overlay }) => {
          marker.setMap(null);
          overlay.setMap(null);
        });
      }

      if (markerClustererRef.current) {
        markerClustererRef.current.clear();
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
    <div>
      <div id="map" className="kakao-map" />
    </div>
  );
};

export default React.memo(Map);
