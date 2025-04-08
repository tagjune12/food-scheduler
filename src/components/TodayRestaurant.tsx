// import RestaurantCard from '@components/commons/RestaurantCard';
import { Restaurant } from '@src/types';
import { useEffect, useRef, useState } from 'react';
import { getNumTypeToday } from '@lib/util';
import '@components/TodayRestaurant.scss';
import { getRestaurantsWithName } from '@lib/api/supabase_api';
import RestaurantCard from './commons/RestaurantCard';

const TodayRestaurant = ({ restaurantName }: { restaurantName: string }) => {
  const visit = useRef<{
    year: number;
    month: number;
    date: number;
  }>(getNumTypeToday());

  const [todayRestaurant, setTodayRestaurant] = useState<
    Restaurant | undefined
  >(undefined);

  useEffect(() => {
    const fetchRestaurant = async () => {
      const restaurant = await getRestaurantsWithName([restaurantName]);
      const formattedRestaurant: Restaurant = {
        name: restaurant[0]?.place_name || '',
        tags: restaurant[0]?.category_name
          ? restaurant[0].category_name.split(' > ')
          : [],
        address: restaurant[0]?.address_name || '',
        period: 0,
      };
      setTodayRestaurant(formattedRestaurant);
      console.log(todayRestaurant);
    };
    fetchRestaurant();
  }, [restaurantName]);

  return (
    <div className="today-restaurant-contianer">
      {/* <h3 className="title">
        {`${visit.current.month}월${visit.current.date}일`} 팀점은
      </h3> */}
      <div className="info-section">
        {todayRestaurant ? (
          <RestaurantCard restaurant={todayRestaurant} />
        ) : (
          <div>몰?루</div>
        )}
        {/* <div>몰?루</div> */}
      </div>
    </div>
  );
};

export default TodayRestaurant;
