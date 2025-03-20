import React, { useContext, useEffect, useRef, useCallback } from 'react';
import restaurants from '@data/restaurants.json';
import { renderToString } from 'react-dom/server';
// import InfoWindow from '@components/commons/InfoWindow';
import RestaurantCard from '@components/commons/RestaurantCard';
import '@components/Map.scss';
import { UseDispatch } from '@src/App';
import { AppStoreType, Restaurant } from '@src/types';

interface MapMarker {
  marker: naver.maps.Marker;
  infoWindow: naver.maps.InfoWindow;
}

interface MarkerStyle {
  width: string;
  height: string;
  backgroundColor: string;
}

const DEFAULT_CENTER = { lat: 37.4028207, lng: 127.1115201 };
const DEFAULT_ZOOM = 16;

const MARKER_STYLE: MarkerStyle = {
  width: '20px',
  height: '20px',
  backgroundColor: '#845EC2',
};

const Map = ({ state }: AppStoreType) => {
  const dispatch = useContext(UseDispatch);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const openedMarkerRef = useRef<number | null>(null);

  const createMarkerContent = useCallback(() => {
    return `
      <div class="custom-marker" style="
        width: ${MARKER_STYLE.width};
        height: ${MARKER_STYLE.height};
        background: ${MARKER_STYLE.backgroundColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
      ">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
        </svg>
      </div>
    `;
  }, []);

  const createInfoWindow = useCallback(
    (restaurant: Restaurant) => {
      console.log(state.histories);
      return new naver.maps.InfoWindow({
        content: renderToString(
          <RestaurantCard
            restaurant={restaurant}
            onMap={true}
            visitDate={state.histories[restaurant.name]?.date}
          />,
        ),
        borderColor: 'none',
        disableAnchor: true,
        backgroundColor: 'none',
        pixelOffset: new naver.maps.Point(0, 0),
      });
    },
    [state.histories],
  );

  const createMarker = useCallback(
    (position: naver.maps.LatLng) => {
      return new naver.maps.Marker({
        position,
        map: mapRef.current ?? undefined,
        icon: {
          content: createMarkerContent(),
          size: new naver.maps.Size(20, 20),
          anchor: new naver.maps.Point(10, 10),
        },
      });
    },
    [createMarkerContent],
  );

  const closeCurrentInfoWindow = useCallback(() => {
    if (openedMarkerRef.current !== null) {
      markersRef.current[openedMarkerRef.current].infoWindow.close();
      openedMarkerRef.current = null;
    }
  }, []);

  const handleMarkerClick = useCallback(
    (index: number) => {
      const { infoWindow } = markersRef.current[index];

      if (openedMarkerRef.current === index) {
        infoWindow.close();
        openedMarkerRef.current = null;
        return;
      }

      closeCurrentInfoWindow();
      infoWindow.open(mapRef.current!, markersRef.current[index].marker);
      openedMarkerRef.current = index;

      // DOM 이벤트 리스너 추가
      const addEventBtn = document.querySelector('.add-event-btn');
      const closeInfoWindowBtn = document.querySelector(
        '.info-window-container .close-btn',
      );

      addEventBtn?.addEventListener('click', () => {
        dispatch({ type: 'showModal', payload: restaurants[index] });
      });

      closeInfoWindowBtn?.addEventListener('click', closeCurrentInfoWindow);
    },
    [dispatch, closeCurrentInfoWindow],
  );

  useEffect(() => {
    // 지도 초기화
    const center = new naver.maps.LatLng(
      DEFAULT_CENTER.lat,
      DEFAULT_CENTER.lng,
    );
    mapRef.current = new naver.maps.Map('map', {
      center,
      zoom: DEFAULT_ZOOM,
    });

    // 마커 생성
    markersRef.current = restaurants.map((restaurant, index) => {
      const position = new naver.maps.LatLng(
        parseFloat(restaurant.position.y),
        parseFloat(restaurant.position.x),
      );

      const marker = createMarker(position);
      const infoWindow = createInfoWindow(restaurant);

      naver.maps.Event.addListener(marker, 'click', () =>
        handleMarkerClick(index),
      );

      return { marker, infoWindow };
    });

    // 지도 클릭 이벤트
    naver.maps.Event.addListener(
      mapRef.current,
      'click',
      closeCurrentInfoWindow,
    );

    // 클린업
    return () => {
      markersRef.current.forEach(({ marker, infoWindow }) => {
        marker.setMap(null);
        infoWindow.close();
      });
    };
  }, [
    createMarker,
    createInfoWindow,
    handleMarkerClick,
    closeCurrentInfoWindow,
  ]);

  return (
    <div>
      <div id="map" className="naver-map" />
    </div>
  );
};

export default Map;
