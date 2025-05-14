// import RestaurantCard from '@components/commons/RestaurantCard';
import { Restaurant } from '@src/types';
import { useEffect, useRef, useState } from 'react';
import { getNumTypeToday } from '@lib/util';
import '@components/sidebar/TodayRestaurant.scss';
import { getRestaurantsWithName } from '@lib/api/supabase_api';
import RestaurantCard from '@components/commons/RestaurantCard';
import TodayRestaurantCard from './TodayRestaurantCard';
import { useTodayRestaurantDispatch } from '@src/context/TodayRestaurantContext';
import Button from '@mui/material/Button';

const TodayRestaurant = ({ restaurantName }: { restaurantName: string }) => {
  // const visit = useRef<{
  //   year: number;
  //   month: number;
  //   date: number;
  // }>(getNumTypeToday());

  const [todayRestaurant, setTodayRestaurant] = useState<
    Restaurant | undefined
  >(undefined);

  const todayRestaurantDispatch = useTodayRestaurantDispatch();

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
      <div className="button-wrapper">
        {/* {todayRestaurant && (
          <Button
            className="delete-button"
            onClick={() => {
              if (window.confirm('삭제하시겠습니까?')) {
                todayRestaurantDispatch({ type: 'deleteEvent' });
              }
            }}
          >
            삭제하기
          </Button>
        )} */}
      </div>
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
