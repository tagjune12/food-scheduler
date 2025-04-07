import React, { lazy, Suspense, useEffect } from 'react';
import { AppStoreType, Restaurant } from '@src/types';
import Modal from '@components/commons/Modal';
import { Skeleton } from '@mui/material';
const MainPage = ({ state }: AppStoreType) => {
  useEffect(() => {
    // console.log(state);
  }, [state]);

  const SideBar = lazy(() => import('@components/SideBar'));
  const Map = lazy(() => import('@components/Map'));

  return (
    <div className="main-page">
      {state.modal.isVisible && <Modal restaurant={state.modal.target} />}
      {/* <Suspense fallback={<div>Loading...</div>}>
        <SideBar state={state} />
      </Suspense>
      <Suspense
        fallback={
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        }
      >
        <Map state={state} />
      </Suspense> */}
      <Suspense
        fallback={
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        }
      >
        <SideBar state={state} />
        <Map state={state} />
      </Suspense>
    </div>
  );
};

export default MainPage;
