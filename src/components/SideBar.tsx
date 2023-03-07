import RestaurantCardContainer from '@containers/RestaurantCardContainer';
import Schedules from '@components/Schedules';
import '@components/History.css';
import { useState } from 'react';

const SideBar = () => {
  const [isHistory, setIsHistory] = useState(false);

  const onClick = () => {
    setIsHistory((isHistory) => !isHistory);
  };

  return (
    <div className="history">
      {/* <Schedules /> */}
      <div
        style={{
          width: '100%',
        }}
      >
        헤더
        <button onClick={onClick}>쿨타임 버튼</button>
      </div>
      <RestaurantCardContainer isHistory={isHistory} />
    </div>
  );
};

export default SideBar;
