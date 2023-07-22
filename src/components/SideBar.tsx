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
    console.log(`History: ${isHistory}`);
  };

  const showSidebar = (isOpen: boolean) => {
    // sideBarRef.current!.style.translate = isOpen ? '0%' : '-100%';
    sideBarRef.current!.style.display = isOpen ? 'block' : 'none';

    // sideBarBtnRef.current!.style.translate = isOpen ? '0%' : '-100%';
  };

  useEffect(() => {
    showSidebar(isOpenMenu);
  }, [isOpenMenu]);

  return (
    <>
      {isHistory && <Calendar closeCalendar={showCalendar} />}
      <div className="sidebar">
        {/* <div className="sidebar-btn-container" ref={sideBarBtnRef}>
          <div className="sidebar-btn">
            <button onClick={showCalendar}>달력 모달버튼</button>
            <button
              onClick={() => {
                setIsOpenMenu((prev) => !prev);
              }}
            >
              {isOpenMenu ? '<' : '>'}
            </button>
          </div>
        </div> */}
        <div id="schedules" ref={sideBarRef}>
          <TodayRestaurant restaurant={state.todayRestaurant} />
          <History histories={state.histories} />
        </div>
        <SidebarButton
          isOpenMenu={isOpenMenu}
          sideBarBtnRef={sideBarBtnRef}
          showCalendar={showCalendar}
          setIsOpenMenu={setIsOpenMenu}
        />
      </div>
    </>
  );
};

export default SideBar;
