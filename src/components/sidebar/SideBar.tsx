import TodayRestaurant from '@components/sidebar/TodayRestaurant';
import { useRef, useState, useEffect, Suspense } from 'react';
import Calendar from '@components/calendar/Calendar';
import '@components/sidebar/SideBar.scss';
import { AppStoreType } from '@src/types';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import { useTodayRestaurantState } from '@src/context/TodayRestaurantContext';
import { Bookmark } from '@components/sidebar/Bookmark';
import { getStoredToken } from '@lib/util';
import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@src/context/AuthContext';

const SideBar = ({
  state,
  isShowSidebar,
}: {
  state: AppStoreType;
  isShowSidebar: boolean;
}) => {
  const [isHistory, setIsHistory] = useState<boolean>(false);
  const sideBarRef = useRef<HTMLDivElement>(null);
  const todayRestaurantState = useTodayRestaurantState();
  const { isLogin } = useAuth();
  const navigate = useNavigate();

  const showCalendar = () => {
    setIsHistory((isHistory) => !isHistory);
  };

  const showSidebar = (isOpen: boolean) => {
    if (!sideBarRef.current) return;
    sideBarRef.current.style.display = isOpen ? 'flex' : 'none';
  };

  useEffect(() => {
    showSidebar(isShowSidebar);
  }, [isShowSidebar]);

  return (
    <>
      {/* {isHistory && <Calendar closeCalendar={showCalendar} />} */}
      <div className="sidebar">
        <div id="schedules" ref={sideBarRef}>
          {/* <div className="schedule-header">
            <h2>오늘의 식사</h2>
          </div>
          <TodayRestaurant
            restaurantName={
              todayRestaurantState.todayRestaurant.name ||
              todayRestaurantState.todayRestaurant.place_name ||
              ''
            }
          /> */}
          {/* <Divider /> */}
         
          {/* <Suspense
            fallback={
              <>
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width={380}
                  height={210}
                  style={{
                    marginBottom: 6,
                  }}
                />
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width={380}
                  height={210}
                  style={{
                    marginBottom: 6,
                  }}
                />
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width={380}
                  height={210}
                  style={{
                    marginBottom: 6,
                  }}
                />
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width={380}
                  height={210}
                  style={{
                    marginBottom: 6,
                  }}
                />
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width={380}
                  height={210}
                  style={{
                    marginBottom: 6,
                  }}
                />
              </>
            }
          > */}
          {isLogin ? (
            <Bookmark />
          ) : (
            <div className="login-wrapper">
              <Button className="login-btn" onClick={() => navigate('/login', { replace: true })}>
                로그인
              </Button>
            </div>
          )}
          {/* </Suspense> */}
        </div>
      </div>
    </>
  );
};

export default SideBar;
