import React, { lazy, Suspense, useState, memo, useEffect } from 'react';
import './MainPage.scss';
import { AppStoreType } from '@src/types';
import Modal from '@components/commons/Modal';
import { Skeleton, useMediaQuery, useTheme } from '@mui/material';
import { useModalState } from '@src/context/ModalContext';
import SideBar from '@components/sidebar/SideBar';
import { MainToolbar } from '@components/commons';
import { Calendar, MobileCalendar } from '@components/calendar';
import { getStoredToken } from '@lib/util';
import { useNavigate } from 'react-router-dom';
import IntroModal from '@components/commons/IntroModal';

// 필터 타입 정의
export type PlaceFilter = 'all' | 'restaurant' | 'cafe';

// 메모이제이션된 Map 컴포넌트
const LazyMap = lazy(() => import('@components/Map').then((module) => ({ default: module.Map })));
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
  const [isShowCalendar, setIsShowCalendar] = useState<boolean>(false);
  const [isShowSidebar, setIsShowSidebar] = useState<boolean>(false);
  const [placeFilter, setPlaceFilter] = useState<PlaceFilter>('all');
  const [showIntroModal, setShowIntroModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    const isLoggedOut = getStoredToken() === null;
    if (isLoggedOut) {
      const hideUntil = localStorage.getItem('hide_intro_modal_until');
      if (!hideUntil || new Date().getTime() > parseInt(hideUntil, 10)) {
        setShowIntroModal(true);
      }
    }
  }, []);

  return (
    <div className="main-page">
      {isShowCalendar && (
        isMobile ? (
          <MobileCalendar closeCalendar={() => setIsShowCalendar(false)} />
        ) : (
          <Calendar closeCalendar={() => setIsShowCalendar(false)} />
        )
      )}
      <MainToolbar
        showCalendar={() => {
          if(getStoredToken() === null){
            if(window.confirm('로그인이 필요합니다. 로그인하시겠습니까?') ){
              navigate('/login', { replace: true });
            }else{
              return;
            } 
          }else{
            setIsShowCalendar(true);
          }
        }}
        // showSidbar={() => setIsShowSidebar((prev) => !prev)}
        showSidebar={setIsShowSidebar}
      />
      {modalState.isVisible && modalState.target && <Modal restaurant={modalState.target} />}
      <IntroModal open={showIntroModal} onClose={() => setShowIntroModal(false)} />
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
          <SideBar
            state={state}
            isShowSidebar={isShowSidebar}
            onClose={() => setIsShowSidebar(false)}
          />
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
      <div className="main-page-footer">
        <a href="/privacy" target="_blank" rel="noopener noreferrer">
          개인정보처리방침
        </a>
      </div>
    </div>
  );
};

export default MainPage;
