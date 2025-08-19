import React, { lazy, Suspense, useState, memo } from 'react';
import { AppStoreType } from '@src/types';
import Modal from '@components/commons/Modal';
import { Skeleton } from '@mui/material';
import { useModalState } from '@src/context/ModalContext';
import SideBar from '@components/sidebar/SideBar';
import MainToolbar from '@components/commons/MainToolbar';
import Calendar from '@components/calendar/Calendar';

// 필터 타입 정의
export type PlaceFilter = 'all' | 'restaurant' | 'cafe';

// 메모이제이션된 Map 컴포넌트
const LazyMap = lazy(() => import('@components/Map'));
const MemoizedMap = memo(
  ({
    state,
    placeFilter,
    setPlaceFilter,
  }: AppStoreType & {
    placeFilter: PlaceFilter;
    setPlaceFilter: React.Dispatch<React.SetStateAction<PlaceFilter>>;
  }) => (
    <LazyMap
      state={state}
      placeFilter={placeFilter}
      setPlaceFilter={setPlaceFilter}
    />
  ),
);

const MainPage = ({ state }: { state: any }) => {
  const modalState = useModalState();
  const [isShowCalendar, setisShowCalendar] = useState<boolean>(false);
  const [isShowSidebar, setIsShowSidebar] = useState<boolean>(false);
  const [placeFilter, setPlaceFilter] = useState<PlaceFilter>('all');

  return (
    <div className="main-page">
      {isShowCalendar && (
        <Calendar closeCalendar={() => setisShowCalendar(false)} />
      )}
      <MainToolbar
        showCalendar={() => setisShowCalendar(true)}
        // showSidbar={() => setIsShowSidebar((prev) => !prev)}
        showSidebar={setIsShowSidebar}
      />
      {modalState.isVisible && <Modal restaurant={modalState.target} />}
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
        {isShowSidebar && (
          <SideBar state={state} isShowSidebar={isShowSidebar} />
        )}
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
        <MemoizedMap
          state={state}
          placeFilter={placeFilter}
          setPlaceFilter={setPlaceFilter}
        />
      </Suspense>
    </div>
  );
};

export default MainPage;
