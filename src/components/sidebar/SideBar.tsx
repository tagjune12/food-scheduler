import TodayRestaurant from '@components/sidebar/TodayRestaurant';
import { useRef, useState, useEffect, Suspense, lazy } from 'react';
import Calendar from '@components/calendar/Calendar';
import '@components/sidebar/SideBar.scss';
import { AppStoreType } from '@src/types';
import {
  BsCalendarPlusFill,
  BsArrowLeftShort,
  BsArrowRightShort,
} from 'react-icons/bs';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import { useTodayRestaurantState } from '@src/context/TodayRestaurantContext';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { Bookmark } from '@components/sidebar/Bookmark';
const SideBar = ({ state }: AppStoreType) => {
  const [isHistory, setIsHistory] = useState<boolean>(false);
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(true);
  const [isBookmark, setIsBookmark] = useState<boolean>(false);
  const sideBarRef = useRef<HTMLDivElement>(null);
  const sideBarBtnRef = useRef<HTMLDivElement>(null);
  const todayRestaurantState = useTodayRestaurantState();

  const History = lazy(() => import('@components/sidebar/History'));

  const showCalendar = () => {
    setIsHistory((isHistory) => !isHistory);
  };

  const showSidebar = (isOpen: boolean) => {
    sideBarRef.current!.style.display = isOpen ? 'block' : 'none';
  };

  useEffect(() => {
    showSidebar(isOpenMenu);
  }, [isOpenMenu]);

  return (
    <>
      {isHistory && <Calendar closeCalendar={showCalendar} />}
      <div className="sidebar">
        <div className="sidebar-btn-container" ref={sideBarBtnRef}>
          <div className="sidebar-btn">
            <button onClick={showCalendar}>
              <BsCalendarPlusFill />
            </button>
            {/* <button onClick={() => setIsBookmark(!isBookmark)}>
              <StarOutlineIcon />
            </button> */}
            <button onClick={() => setIsOpenMenu(!isOpenMenu)}>
              {isOpenMenu ? <BsArrowLeftShort /> : <BsArrowRightShort />}
            </button>
          </div>
        </div>
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
            {isBookmark ? (
              <Bookmark />
            ) : (
              // <History histories={state.histories} />
              <Bookmark />
            )}
          </Suspense>
          {/* <History histories={state.histories} /> */}
        </div>
      </div>
    </>
  );
};

export default SideBar;
