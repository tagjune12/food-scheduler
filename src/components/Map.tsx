import React, { useEffect, useRef } from 'react';
import '@components/Map.css';
import restaurants from '@data/restaurants.json';
// import RestaurantCard from '@components/RestaurantCard';
import CustomOverlay from '@utils/custom_overlay';
import { renderToString } from 'react-dom/server';
import RestaurantCardContainer from '@containers/RestaurantCardContainer';

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

    const infoWindowString = renderToString(<RestaurantCardContainer />);

    restaurants.forEach((restaurant) => {
      const { position } = restaurant;
      const markerPosition: naver.maps.LatLng = new naver.maps.LatLng(
        parseFloat(position.y), // y
        parseFloat(position.x), // x
      );
      // 지도위에 좌표 설정
      const marker: naver.maps.Marker = new naver.maps.Marker({
        position: markerPosition,
        map: map,
      });

      marker.setMap(map);

      naver.maps.Event.addListener(marker, 'click', () => {
        console.log('infoWindowString', infoWindowString);
        const customOverlay = new CustomOverlay(infoWindowString, {
          position: markerPosition,
          map: map,
        });

        // customOverlay.onAdd();
        customOverlay.setMap(map);
        console.log('clicked', customOverlay.getPosition());
        console.log('clicked', customOverlay);
      });
    });
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
