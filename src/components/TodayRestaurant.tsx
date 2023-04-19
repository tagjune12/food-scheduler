import RestaurantCard from '@components/commons/RestaurantCard';
import { Restaurant } from 'types';

type props = {
  restaurant: Restaurant | null;
};

const TodayRestaurant = ({ restaurant }: props) => {
  return (
    <div>
      {restaurant ? (
        <RestaurantCard restaurant={restaurant} />
      ) : (
        <div>예정 없음</div>
      )}
    </div>
  );
};

export default TodayRestaurant;
