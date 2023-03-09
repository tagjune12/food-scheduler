import React, { useEffect, useRef } from 'react';
import '@components/Map.css';
// import { Helmet } from 'react-helmet';
import restaurants from '@data/restaurants.json';
import RestaurantCard from '@components/RestaurantCard';

const Map = () => {
  useEffect(() => {
    // 지도 중앙좌표 설정
    const center: naver.maps.LatLng = new naver.maps.LatLng(
      37.4028207, // y
      127.1115201, // x
    );
    // 중앙 좌표를 중심으로 하는 지도 생성
    const map: naver.maps.Map = new naver.maps.Map('map', {
      center: center,
      zoom: 16, // default
    });

    const markers: naver.maps.Marker[] = [];

    restaurants.forEach((restaurant) => {
      const { position } = restaurant;
      const markerPosition: naver.maps.LatLng = new naver.maps.LatLng(
        parseFloat(position.y), // y
        parseFloat(position.x), // x
      );
      // 지도위에 좌표 설정
      markers.push(
        new naver.maps.Marker({
          position: markerPosition,
          map: map,
        }),
      );
    });
    const infoWindows: naver.maps.InfoWindow[] = [];

    restaurants.forEach((restaurant, index) => {
      infoWindows.push(
        new naver.maps.InfoWindow({
          // content: `<div id="info-window" onclick='console.log("clicked")'>테스트<div/>`,
          content: `<div id="info-window">
            <button>버튼버튼</button>
          <div/>`,
        }),
      );
      // infoWindows.at(-1)?.open(map, markers[index]);
    });

    // 정보창은 하나밖에 활성화가 안된다
    // 여러개 띄우고 싶으면 오버레이로 구현해야함
    infoWindows[0]?.open(map, markers[0]);
    // infoWindows[1]?.open(map, markers[1]);
    // infoWindows[2]?.open(map, markers[2]);

    for (let i = 0; i < markers.length; i++) {
      naver.maps.Event.addListener(markers[i], 'click', () => {
        infoWindows[i].open(map, markers[i]);
        console.log('marker is clicked');
      });
    }

    // infoWindows[0].open(map, markers[0]);
    naver.maps.Event.addListener(infoWindows[0], 'click', () => {
      console.log('info window is clicked');
    });

    // naver.maps.Event.addDOMListener(
    //   document.querySelector('#info-window')!,
    //   'click',
    //   () => {
    //     console.log('info window is clicked');
    //   },
    // );

    console.log('useEffect is work');
  }, []);

  const mapStyle = {
    width: '100vw',
    height: '100vh',
  };

  // // 이벤트 리스너 붙여도 빌드하면 안붙어있음
  // document.querySelector('#info-window')!.addEventListener('click', () => {
  //   console.log('info window is clicked');
  // });

  return (
    <>
      <div id="map" className="naver-map" style={mapStyle} />
    </>
  );
};

export default Map;
