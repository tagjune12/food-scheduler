import TodayRestaurant from '@components/sidebar/TodayRestaurant';
import { useRef, useState, useEffect, Suspense, lazy } from 'react';
import Calendar from '@components/calendar/Calendar';
import '@components/sidebar/SideBar.scss';
import { AppStoreType } from '@src/types';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import { useTodayRestaurantState } from '@src/context/TodayRestaurantContext';
import { Bookmark } from '@components/sidebar/Bookmark';
const SideBar = ({
  state,
  isShowSidebar,
}: {
  state: AppStoreType;
  isShowSidebar: boolean;
}) => {
  const [isHistory, setIsHistory] = useState<boolean>(false);
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(true);
  const [isBookmark, setIsBookmark] = useState<boolean>(false);
  const sideBarRef = useRef<HTMLDivElement>(null);
  const todayRestaurantState = useTodayRestaurantState();

  const History = lazy(() => import('@components/sidebar/History'));

  const showCalendar = () => {
    setIsHistory((isHistory) => !isHistory);
  };

  const showSidebar = (isOpen: boolean) => {
    if (!sideBarRef.current) return;
    sideBarRef.current.style.display = isOpen ? 'block' : 'none';
  };

  useEffect(() => {
    showSidebar(isShowSidebar);
  }, [isShowSidebar]);

  return (
    <>
      {isHistory && <Calendar closeCalendar={showCalendar} />}
      <div className="sidebar">
        <div id="schedules" ref={sideBarRef}>
          <div className="schedule-header">
            <h2>오늘의 식사</h2>
          </div>
          <TodayRestaurant
            restaurantName={
              todayRestaurantState.todayRestaurant.name ||
              todayRestaurantState.todayRestaurant.place_name ||
              ''
            }
          />
          <Divider />
          &nbsp;
          <div className="schedule-header">
            <h2>즐겨찾기</h2>
          </div>
          <Suspense
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
          >
            {isBookmark ? <Bookmark /> : <Bookmark />}
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default SideBar;
