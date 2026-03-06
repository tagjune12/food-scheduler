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
import { Box, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@src/context/AuthContext';

const SideBar = ({
  state,
  isShowSidebar,
  onClose,
}: {
  state: AppStoreType;
  isShowSidebar: boolean;
  onClose?: () => void;
}) => {
  // const [isHistory, setIsHistory] = useState<boolean>(false);
  const sideBarRef = useRef<HTMLDivElement>(null);
  // const todayRestaurantState = useTodayRestaurantState();
  const { isLogin } = useAuth();
  const navigate = useNavigate();

  // const showCalendar = () => {
  //   setIsHistory((isHistory) => !isHistory);
  // };

  const showSidebar = (isOpen: boolean) => {
    if (!sideBarRef.current) return;
    sideBarRef.current.style.display = isOpen ? 'flex' : 'none';
  };

  useEffect(() => {
    showSidebar(isShowSidebar);
  }, [isShowSidebar]);

  return (
    <>
      {/* 모바일 오버레이: 사이드바 외부 클릭 시 닫기 */}
      <div className="sidebar-overlay" onClick={onClose} />

      {/* {isHistory && <Calendar closeCalendar={showCalendar} />} */}
      <div className="sidebar">
        <div id="schedules" ref={sideBarRef}>
          {/* 모바일 전용 닫기 버튼 */}
          <Box
            sx={{
              display: { xs: 'flex', sm: 'none' },
              justifyContent: 'flex-end',
              mb: 1,
            }}
          >
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {isLogin ? (
            <Bookmark />
          ) : (
            <div className="login-wrapper">
              <Button className="login-btn" onClick={() => navigate('/login', { replace: true })}>
                로그인
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SideBar;
