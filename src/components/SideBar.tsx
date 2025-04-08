import TodayRestaurant from '@components/TodayRestaurant';
import { useRef, useState, useEffect, Suspense, lazy } from 'react';
import Calendar from '@components/Calendar';
import '@components/SideBar.scss';
import { AppStoreType } from '@src/types';
import {
  BsCalendarPlusFill,
  BsArrowLeftShort,
  BsArrowRightShort,
} from 'react-icons/bs';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';

// const SidebarButton = ({
//   isOpenMenu,
//   sideBarBtnRef,
//   showCalendar,
//   setIsOpenMenu,
// }: {
//   isOpenMenu: boolean;
//   sideBarBtnRef: React.RefObject<HTMLDivElement>;
//   showCalendar: () => void;
//   setIsOpenMenu: (value: React.SetStateAction<boolean>) => void;
// }) => {
//   return (
//     <>
//       <div className="sidebar-btn-container" ref={sideBarBtnRef}>
//         <div className="sidebar-btn">
//           <button onClick={showCalendar}>
//             <BsCalendarPlusFill />
//           </button>
//           <button
//             onClick={() => {
//               setIsOpenMenu((prev) => !prev);
//             }}
//           >
//             {isOpenMenu ? <BsArrowLeftShort /> : <BsArrowRightShort />}
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

const SideBar = ({ state }: AppStoreType) => {
  const [isHistory, setIsHistory] = useState<boolean>(false);
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(true);
  const sideBarRef = useRef<HTMLDivElement>(null);
  const sideBarBtnRef = useRef<HTMLDivElement>(null);

  const History = lazy(() => import('@components/History'));

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
            <button onClick={() => setIsOpenMenu(!isOpenMenu)}>
              {isOpenMenu ? <BsArrowLeftShort /> : <BsArrowRightShort />}
            </button>
          </div>
        </div>
        <div id="schedules" ref={sideBarRef}>
          <div className="schedule-header">
            <h2>오늘의 식사</h2>
          </div>
          <TodayRestaurant restaurantName={state.todayRestaurant.name ?? ''} />
          <Divider />
          &nbsp;
          <div className="schedule-header">
            <h2>최근에 먹은거</h2>
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
            <History histories={state.histories} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default SideBar;
