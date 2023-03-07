import restaurants from '@data/restaurants.json'; 
import RestaurantCard from '@components/RestaurantCard';
import '@containers/RestaurantCardContainer.css';

const RestaurantCardContainer = () => {
  return (
    <div className="restaurent container">
      {restaurants.map((restaurant, index) => (
        <RestaurantCard key={index} restaurant={restaurant}></RestaurantCard>
      ))}
    </div>
  );
};

export default RestaurantCardContainer;
