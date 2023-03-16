import TodayRestaurant from '@components/TodayRestaurant';
import History from '@components/History';
import '@components/History.css';
import { useState } from 'react';
import Candidates from '@components/Candidates';

const SideBar = () => {
  const [isHistory, setIsHistory] = useState(false);

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
      <TodayRestaurant />
      {isHistory ? <History /> : <Candidates />}
    </div>
  );
};

export default SideBar;
