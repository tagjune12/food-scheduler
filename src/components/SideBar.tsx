import TodayRestaurant from '@components/TodayRestaurant';
import History from '@components/History';
import { useState } from 'react';
import Calendar from './Calendar';
import '@components/SideBar.scss';

import { AppStoreType } from '@src/types';

const SideBar = ({ state }: AppStoreType) => {
  const [isHistory, setIsHistory] = useState<boolean>(false);

  const onClick = () => {
    setIsHistory((isHistory) => !isHistory);
    console.log(`History: ${isHistory}`);
  };

  return (
    <div className="side-bar">
      <div>
        <button onClick={onClick}>달력 모달버튼</button>
      </div>

      {isHistory && <Calendar />}

      <TodayRestaurant restaurant={state.todayRestaurant} />
      <History histories={state.histories} />
    </div>
  );
};

export default SideBar;
