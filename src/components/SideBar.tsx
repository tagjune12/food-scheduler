import TodayRestaurant from '@components/TodayRestaurant';
import History from '@components/History';
import { useRef, useState, useEffect } from 'react';
import Calendar from '@components/Calendar';
import '@components/SideBar.scss';
import { AppStoreType } from '@src/types';
import {
  BsCalendarPlusFill,
  BsArrowLeftShort,
  BsArrowRightShort,
} from 'react-icons/bs';

const SidebarButton = ({
  isOpenMenu,
  sideBarBtnRef,
  showCalendar,
  setIsOpenMenu,
}: {
  isOpenMenu: boolean;
  sideBarBtnRef: React.RefObject<HTMLDivElement>;
  showCalendar: () => void;
  setIsOpenMenu: (value: React.SetStateAction<boolean>) => void;
}) => {
  return (
    <>
      <div className="sidebar-btn-container" ref={sideBarBtnRef}>
        <div className="sidebar-btn">
          <button onClick={showCalendar}>
            <BsCalendarPlusFill />
          </button>
          <button
            onClick={() => {
              setIsOpenMenu((prev) => !prev);
            }}
          >
            {isOpenMenu ? <BsArrowLeftShort /> : <BsArrowRightShort />}
          </button>
        </div>
      </div>
    </>
  );
};

const SideBar = ({ state }: AppStoreType) => {
  const [isHistory, setIsHistory] = useState<boolean>(false);
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(true);
  const sideBarRef = useRef<HTMLDivElement>(null);
  const sideBarBtnRef = useRef<HTMLDivElement>(null);

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
          <div className="schedule-header">
            <h2>최근에 먹은거</h2>
          </div>
          <History histories={state.histories} />
        </div>
      </div>
    </>
  );
};

export default SideBar;
