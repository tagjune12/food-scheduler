import RestaurantCard from '@components/commons/RestaurantCard';
import restaurants from '@data/restaurants.json';

const History = ({ histories }: { histories: any }) => {
  return (
    <div className="history-container">
      {restaurants.map((restaurant, index) => {
        return (
          <RestaurantCard
            key={restaurant.name}
            restaurant={restaurant}
            visit={histories[restaurant.name]}
            period={30}
          />
        );
      })}
    </div>
  );
};

export default History;
