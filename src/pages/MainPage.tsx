import React from 'react';
import '@pages/MainPage.css';
import Map from '@components/Map';
import SideBar from '@components/SideBar';
// import { HistoryType } from 'types';

// type MainPageProps = {
//   history: HistoryType;
// };

const MainPage = () => {
  return (
    <div className="main-page">
      <SideBar />
      <Map />
    </div>
  );
};

export default MainPage;
