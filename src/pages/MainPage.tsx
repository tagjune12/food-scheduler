import React, { lazy, Suspense, useEffect, useState, memo } from 'react';
import { AppStoreType, Restaurant } from '@src/types';
import Modal from '@components/commons/Modal';
import { Skeleton } from '@mui/material';
import { useModalState } from '@src/context/ModalContext';
import SideBar from '@components/sidebar/SideBar';
import MainToolbar from '@components/commons/MainToolbar';
import Calendar from '@components/calendar/Calendar';

// 메모이제이션된 Map 컴포넌트
const LazyMap = lazy(() => import('@components/Map'));
const MemoizedMap = memo(({ state }: AppStoreType) => (
  <LazyMap state={state} />
));

const MainPage = ({ state }: { state: any }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const modalState = useModalState();
  const [isShowCalendar, setisShowCalendar] = useState<boolean>(false);
  const [isShowSidebar, setIsShowSidebar] = useState<boolean>(false);

  useEffect(() => {
    // 페이지 완전 로드 후 로딩 상태 업데이트
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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
        <MemoizedMap state={state} />
      </Suspense>
    </div>
  );
};

export default MainPage;
