import React from 'react';
import Map from '@components/Map';
import SideBar from '@components/SideBar';
import { AppStoreType } from '@src/types';

const MainPage = ({ state }: AppStoreType) => {
  return (
    <div className="main-page">
      <SideBar state={state} />
      <Map />
    </div>
  );
};

export default MainPage;
