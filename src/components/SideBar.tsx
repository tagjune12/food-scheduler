import TodayRestaurant from '@components/TodayRestaurant';
import History from '@components/History';
import '@components/History.css';
import { useState } from 'react';
import { HistoryType } from 'types';
import Calendar from './Calendar';

type SideBarProps = {
  history: HistoryType;
};

const SideBar = ({ history }: SideBarProps) => {
  const [isHistory, setIsHistory] = useState(true);

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
          <TodayRestaurant />
          <History history={history} />
        </>
      ) : (
        <Calendar />
      )}
    </div>
  );
};

export default SideBar;
