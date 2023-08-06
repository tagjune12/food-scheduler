import RestaurantCard from '@components/commons/RestaurantCard';
import restaurants from '@data/restaurants.json';
import { HistoryType } from '@src/types';
import '@components/History.scss';

const History = ({ histories }: { histories: HistoryType }) => {
  return (
    <div className="history-container">
      <div className="restaurant-card-container">
        {restaurants.map((restaurant) => {
          return (
            <>
              <RestaurantCard
                key={restaurant.name}
                restaurant={restaurant}
                visitDate={histories[restaurant.name]?.date}
              />
              <p></p>
            </>
          );
        })}
      </div>
    </div>
  );
};

export default History;
