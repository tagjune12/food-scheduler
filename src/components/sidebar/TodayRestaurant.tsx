// import RestaurantCard from '@components/commons/RestaurantCard';
import { Restaurant } from '@src/types';
import { useEffect, useRef, useState } from 'react';
import { getNumTypeToday } from '@lib/util';
import '@components/sidebar/TodayRestaurant.scss';
import { getRestaurantsWithName } from '@lib/api/supabase_api';
import RestaurantCard from '@components/commons/RestaurantCard';
import TodayRestaurantCard from './TodayRestaurantCard';
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
      if (restaurant.length > 0) {
        const formattedRestaurant: any = {
          place_name: restaurant[0]?.place_name || '',
          tags: restaurant[0]?.category_name
            ? restaurant[0].category_name.split(' > ')
            : [],
          address: restaurant[0]?.address_name || '',
          period: 0,
        };
        setTodayRestaurant(formattedRestaurant);
      } else {
        setTodayRestaurant(undefined);
      }
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
          // <RestaurantCard restaurant={todayRestaurant} />
          <TodayRestaurantCard restaurant={todayRestaurant} />
        ) : (
          // <TodayRestaurantCard restaurant={todayRestaurant} />
          <div className={`card-container `}>
            <div>아직 못정했어요...</div>
          </div>
        )}
        {/* <div>몰?루</div> */}
      </div>
    </div>
  );
};

export default TodayRestaurant;
