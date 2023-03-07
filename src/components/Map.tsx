import React, { useEffect, useRef } from 'react';
import '@components/Map.css';
// import { Helmet } from 'react-helmet';
import restaurants from '@data/restaurants.json';

const Map = () => {
  useEffect(() => {
    const center: naver.maps.LatLng = new naver.maps.LatLng(
      37.4028207, // y
      127.1115201, // x
    );

    const map: naver.maps.Map = new naver.maps.Map('map', {
      center: center,
      zoom: 16, // default
    });

    restaurants.forEach((restaurant, index) => {
      const { position } = restaurant;
      const markerPosition: naver.maps.LatLng = new naver.maps.LatLng(
        parseFloat(position.y), // y
        parseFloat(position.x), // x
      );

      const marker = new naver.maps.Marker({
        position: markerPosition,
        map: map,
      });

      console.log(index);
    });

    // const marker = new naver.maps.Marker({
    //   position: center,
    //   map: map,
    // });
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
