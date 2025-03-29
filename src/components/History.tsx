import RestaurantCard from '@components/commons/RestaurantCard';
// import restaurants from '@data/restaurants.json';
import restaurants from '@data/restaurant2.json';
import { HistoryType } from '@src/types';
import '@components/History.scss';

const History = ({ histories }: { histories: HistoryType }) => {
  return (
    <div className="history-container">
      <div className="restaurant-card-container">
        {restaurants.documents.map((restaurant) => {
          return (
            <>
              <RestaurantCard
                key={restaurant.place_name}
                restaurant={restaurant}
                visitDate={histories[restaurant.place_name]?.date}
              />
            </>
          );
        })}
      </div>
    </div>
  );
};

export default History;
