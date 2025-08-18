import { Restaurant } from '@src/types';
import { useEffect, useState } from 'react';
import '@components/sidebar/TodayRestaurant.scss';
import { getRestaurantsWithName } from '@lib/api/supabase_api';
import TodayRestaurantCard from '@components/sidebar/TodayRestaurantCard';

const TodayRestaurant = ({ restaurantName }: { restaurantName: string }) => {
  const [todayRestaurant, setTodayRestaurant] = useState<
    Restaurant | undefined
  >(undefined);

  useEffect(() => {
    const fetchRestaurant = async () => {
      const restaurant = await getRestaurantsWithName([restaurantName]);
      if (restaurant.length > 0) {
        const formattedRestaurant: any = {
          place_name: restaurant[0]?.place_name || '',
          category_name: restaurant[0]?.category_name || '',
          address: restaurant[0]?.address_name || '',
          period: 0,
          place_url: restaurant[0]?.place_url || '',
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
      <div className="button-wrapper"></div>
      <div className="info-section">
        {todayRestaurant ? (
          <TodayRestaurantCard restaurant={todayRestaurant} />
        ) : (
          <div className={`card-container `}>
            <div>아직 못정했어요...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayRestaurant;
