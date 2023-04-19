import TodayRestaurant from '@components/TodayRestaurant';
import History from '@components/History';
import '@components/History.css';
import { useState } from 'react';
import { Restaurant } from 'types';
import Calendar from './Calendar';
import RestaurantCard from '@components/commons/RestaurantCard';

// type SideBarProps = {
//   history: HistoryType;
// };

const SideBar = () => {
  const [isHistory, setIsHistory] = useState<boolean>(true);
  const [todayRestaurant, setTodayRestaurant] = useState<Restaurant | null>(
    null,
  );

  const onClick = () => {
    setIsHistory((isHistory) => !isHistory);
    console.log(`History: ${isHistory}`);
  };

  return (
    <div className="side-bar">
      <div
        style={{
          width: '100%',
        }}
      >
        헤더
        <button onClick={onClick}>쿨타임 버튼</button>
      </div>

      {isHistory ? (
        <>
          <TodayRestaurant restaurant={todayRestaurant} />
          <History setTodayRestaurant={setTodayRestaurant} />
        </>
      ) : (
        <Calendar />
      )}
    </div>
  );
};

export default SideBar;
