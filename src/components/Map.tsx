import React, {
  useContext,
  useEffect,
  useRef,
  MouseEvent,
  PointerEvent,
} from 'react';
import restaurants from '@data/restaurants.json';
import { renderToString } from 'react-dom/server';
import InfoWindow from '@components/commons/InfoWindow';
import RestaurantCard from '@components/commons/RestaurantCard';
import '@components/Map.scss';
import { UseDispatch } from '@src/App';

const Map = () => {
  const opened = useRef<number | null>(0);
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
        // <InfoWindow data={restaurant} />,
        <RestaurantCard restaurant={restaurant} onMap={true} />,
      );
      infoWindows.push(
        new naver.maps.InfoWindow({
          content: contentString,
        }),
      );
    });

    // new naver.maps.Marker({
    //   position: center,
    //   map: naverMap,
    // });

    // 정보창은 하나밖에 활성화가 안된다
    // 여러개 띄우고 싶으면 오버레이로 구현해야함
    for (let i = 0; i < markers.length; i++) {
      naver.maps.Event.addListener(markers[i], 'click', () => {
        if (opened.current !== i) {
          infoWindows[i].open(naverMap, markers[i]);
          opened.current = i;
          // InfoWindow에 있는 요소에 EventListener 부착
          document
            // .querySelector('.add-event-btn')!
            .querySelector('.add-event-btn')!
            .addEventListener('click', () => {
              // 모달창 띄우기
              dispatch({ type: 'showModal', payload: restaurants[i] });
            });
          document
            // .querySelector('.info-window-container .close-btn')!
            .querySelector('.card-container .close-btn')!
            .addEventListener('click', (event: unknown): void => {
              // info창 닫기
              // infoWindows[i].close();
              const mouseEvent: PointerEvent = event as PointerEvent;
              console.log(
                mouseEvent?.nativeEvent.offsetX,
                mouseEvent?.nativeEvent.offsetY,
              );
            });
        }
        console.log('marker is clicked', i);
      });
    }

    naver.maps.Event.addListener(naverMap, 'click', () => {
      if (opened.current !== null) {
        infoWindows[opened.current].close();
      }
      console.log(opened.current);
    });

    console.log('useEffect is work');
  }, []);

  return (
    <div>
      <div id="map" className="naver-map" />
    </div>
  );
};

export default Map;
