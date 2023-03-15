import restaurants from '@data/restaurants.json';
import RestaurantCard from '@components/RestaurantCard';
import '@containers/RestaurantCardContainer.css';

type RestaurantCardContainerProps = {
  isHistory?: boolean;
};

const RestaurantCardContainer = ({
  isHistory,
}: RestaurantCardContainerProps) => {
  return (
    <div className="restaurent container">
      {restaurants.map((restaurant, index) => (
        <RestaurantCard
          key={index}
          restaurant={restaurant}
          isHistory={isHistory}
        />
      ))}
    </div>
  );
};

export default RestaurantCardContainer;
