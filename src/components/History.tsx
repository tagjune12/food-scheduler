import RestaurantCardContainer from '@containers/RestaurantCardContainer';
import Schedules from '@components/Schedules';
import '@components/History.css';

const History = () => {
  return (
    <div className="history">
      {/* <Schedules /> */}
      <div
        style={{
          width: '100%',
        }}
      >
        헤더
        <button>쿨타임 버튼</button>
      </div>
      <RestaurantCardContainer />
    </div>
  );
};

export default History;
