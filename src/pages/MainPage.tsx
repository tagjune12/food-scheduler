import React from 'react';
import '@pages/MainPage.css';
import Map from '@components/Map';
import SideBar from '@components/SideBar';

const MainPage = () => {
  return (
    <div className="main-page">
      <SideBar />
      <Map />
    </div>
  );
};

export default MainPage;
