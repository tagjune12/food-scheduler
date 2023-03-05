import React from 'react';
import '@pages/MainPage.css';
import Map from '@components/Map';
import History from '@components/History';

const MainPage = () => {
  return (
    <div className="main-page">
      <History />
      <Map />
    </div>
  );
};

export default MainPage;
