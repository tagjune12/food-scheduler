import React, { useEffect, useRef } from 'react';
import '@components/Map.css';
// import { Helmet } from 'react-helmet';

const Map = () => {
  useEffect(() => {
    const center: naver.maps.LatLng = new naver.maps.LatLng(
      37.4028207,
      127.1115201,
    );

    const map: naver.maps.Map = new naver.maps.Map('map', {
      center: center,
      zoom: 16, // default
    });
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
