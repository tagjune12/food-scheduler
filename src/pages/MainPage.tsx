import React, { useEffect } from 'react';
import Map from '@components/Map';
import SideBar from '@components/SideBar';
import { AppStoreType, Restaurant } from '@src/types';
import Modal from '@components/commons/Modal';

const MainPage = ({ state }: AppStoreType) => {
  useEffect(() => {
    // console.log(state);
  }, [state]);

  return (
    <div className="main-page">
      {state.modal.isVisible && <Modal restaurant={state.modal.target} />}
      <SideBar state={state} />
      <Map state={state} />
    </div>
  );
};

export default MainPage;
