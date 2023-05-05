import RestaurantCard from '@components/commons/RestaurantCard';
import { Restaurant } from '@src/types';
import { useEffect, useState } from 'react';

type props = {
  restaurant: Restaurant;
};

const TodayRestaurant = ({ restaurant }: props) => {
  const [visit, setVisit] = useState<string>();

  useEffect(() => {
    const today = new Date();
    setVisit(
      `${today.getFullYear()}-${today
        .getMonth()
        .toString()
        .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`,
    );
  }, []);

  return (
    <div>
      {Object.keys(restaurant as Object).length > 0 ? (
        <RestaurantCard restaurant={restaurant} visitDate={visit} />
      ) : (
        <div>예정 없음</div>
      )}
    </div>
  );
};

export default TodayRestaurant;
