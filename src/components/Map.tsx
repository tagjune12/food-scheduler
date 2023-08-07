import React, { useContext, useEffect, useRef } from 'react';
import restaurants from '@data/restaurants.json';
import { renderToString } from 'react-dom/server';
// import InfoWindow from '@components/commons/InfoWindow';
import RestaurantCard from '@components/commons/RestaurantCard';
import '@components/Map.scss';
import { UseDispatch } from '@src/App';

const Map = () => {
  const opened = useRef<number | null>(null);
  const dispatch = useContext(UseDispatch);

  useEffect(() => {
    // 지도 중앙좌표 설정
    const center: naver.maps.LatLng = new naver.maps.LatLng(
      37.4028207, // y
      127.1115201, // x
    );
    // 중앙 좌표를 중심으로 하는 지도 생성
    const naverMap: naver.maps.Map = new naver.maps.Map('map', {
      center: center,
      zoom: 16, // default
    });

    const markers: naver.maps.Marker[] = [];
    const infoWindows: naver.maps.InfoWindow[] = [];

    restaurants.forEach((restaurant) => {
      const { position } = restaurant;
      const restaurantPostion: naver.maps.LatLng = new naver.maps.LatLng(
        parseFloat(position.y), // y
        parseFloat(position.x), // x
      );
      // 지도위에 좌표 설정
      markers.push(
        new naver.maps.Marker({
          position: restaurantPostion,
          map: naverMap,
        }),
      );
      const contentString: string = renderToString(
        <RestaurantCard restaurant={restaurant} onMap={true} />,
      );
      infoWindows.push(
        new naver.maps.InfoWindow({
          content: contentString,
          borderColor: 'none',
          disableAnchor: true,
          backgroundColor: 'none',
          pixelOffset: new naver.maps.Point(0, 0),
        }),
      );
    });

    // 정보창은 하나밖에 활성화가 안된다
    // 여러개 띄우고 싶으면 오버레이로 구현해야함
    for (let i = 0; i < markers.length; i++) {
      naver.maps.Event.addListener(markers[i], 'click', () => {
        // console.log('marker is clicked', i, 'current: ', opened.current);
        // 이전에 눌럿던것과 다른걸 누른경우
        if (opened.current !== i && opened.current != null) {
          // 이전 정보창 닫기
          infoWindows[opened.current].close();
        }
        // 똑같은거 또 누르면
        if (opened.current === i) {
          // 닫기
          infoWindows[opened.current].close();
          opened.current = null;

          return;
        }

        infoWindows[i].open(naverMap, markers[i]);
        opened.current = i;

        // InfoWindow에 있는 요소에 EventListener 부착
        const addEventBtn: HTMLDivElement | HTMLButtonElement | null =
          document.querySelector('.add-event-btn');
        if (addEventBtn) {
          addEventBtn.addEventListener('click', () => {
            // 모달창 띄우기
            dispatch({ type: 'showModal', payload: restaurants[i] });
          });
        }
        const closeInfoWindowBtn: HTMLDivElement | HTMLButtonElement | null =
          document.querySelector('.info-window-container .close-btn');

        if (closeInfoWindowBtn) {
          closeInfoWindowBtn.addEventListener('click', () => {
            // info창 닫기
            infoWindows[i].close();
            // console.log('모달창 끄기');
          });
        }
      });
    }

    naver.maps.Event.addListener(naverMap, 'click', () => {
      if (opened.current !== null) {
        // dispatch({ type: 'showModal' });
        infoWindows[opened.current].close();
        opened.current = null;
      }
      // console.log(opened.current);
    });

    // console.log('useEffect is work');
  }, []);

  return (
    <div>
      <div id="map" className="naver-map" />
    </div>
  );
};

export default Map;
