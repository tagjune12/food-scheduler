import React from 'react';
import Map from '@components/Map';
import SideBar from '@components/SideBar';
import { AppStoreType, Restaurant } from '@src/types';
import Modal from '@components/commons/Modal';

const MainPage = ({ state }: AppStoreType) => {
  return (
    <div className="main-page">
      {state.modal.isVisible && <Modal restaurant={state.modal.target} />}
      <SideBar state={state} />
      <Map />
    </div>
  );
};

export default MainPage;
