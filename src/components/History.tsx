import RestaurantCard from '@components/commons/RestaurantCard';
import { HistoryType } from '@src/types';
import '@components/History.scss';
import { useEffect, useState } from 'react';
import { getRestaurantsWithName } from '@src/lib/api/supabase_api';

const History = ({ histories }: { histories: HistoryType }) => {
  console.log('histories', histories);
  const [historyRestaurants, setHistoryRestaurants] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistoryRestaurants = async () => {
      const response = await getRestaurantsWithName(Object.keys(histories));
      setHistoryRestaurants(response);
      console.log('historyRestaurants', historyRestaurants);
    };
    fetchHistoryRestaurants();
  }, [histories]);

  return (
    <div className="history-container">
      <div className="restaurant-card-container">
        {historyRestaurants.map((restaurant) => {
          return (
            <>
              <RestaurantCard
                key={restaurant.place_name}
                restaurant={restaurant}
                visitDate={histories[restaurant.place_name]?.date}
              />
            </>
          );
        })}
      </div>
    </div>
  );
};

export default History;
