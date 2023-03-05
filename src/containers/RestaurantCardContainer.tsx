import restaurants from '@data/restaurants.json'; // 런타임에서 절대경로 적용 안됨(왜지)
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
