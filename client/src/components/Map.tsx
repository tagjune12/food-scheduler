import React, { useEffect, useRef } from 'react';
import '@components/Map.css';
import restaurants from '@data/restaurants.json';
import { renderToString } from 'react-dom/server';
import InfoWindow from '@components/commons/InfoWindow';

const Map = () => {
  const opened = useRef<number | null>(0);

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
        <InfoWindow data={restaurant} />,
      );
      infoWindows.push(
        new naver.maps.InfoWindow({
          content: contentString,
        }),
      );
    });

    // markers.push(
    //   new naver.maps.Marker({
    //     position: center,
    //     map: naverMap,
    //   }),
    // );
    new naver.maps.Marker({
      position: center,
      map: naverMap,
    });

    // 정보창은 하나밖에 활성화가 안된다
    // 여러개 띄우고 싶으면 오버레이로 구현해야함
    for (let i = 0; i < markers.length; i++) {
      naver.maps.Event.addListener(markers[i], 'click', () => {
        if (opened.current !== i) {
          infoWindows[i].open(naverMap, markers[i]);
          opened.current = i;
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

  const mapStyle = {
    width: '100vw',
    height: '100vh',
  };

  return (
    <>
      <div id="map" className="naver-map" style={mapStyle} />
    </>
  );
};

export default Map;