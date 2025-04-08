import React, { lazy, Suspense, useEffect, useState, memo } from 'react';
import { AppStoreType, Restaurant } from '@src/types';
import Modal from '@components/commons/Modal';
import { Skeleton } from '@mui/material';

// 메모이제이션된 Map 컴포넌트
const LazyMap = lazy(() => import('@components/Map'));
const MemoizedMap = memo(({ state }: AppStoreType) => (
  <LazyMap state={state} />
));

// 메모이제이션된 SideBar 컴포넌트
const LazySideBar = lazy(() => import('@components/SideBar'));
const MemoizedSideBar = memo(({ state }: AppStoreType) => (
  <LazySideBar state={state} />
));

const MainPage = ({ state }: AppStoreType) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 페이지 완전 로드 후 로딩 상태 업데이트
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="main-page">
      {state.modal.isVisible && <Modal restaurant={state.modal.target} />}
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
        <MemoizedSideBar state={state} />
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
