import RestaurantCard from '@components/commons/RestaurantCard';
import { HistoryType, Restaurant } from '@src/types';
import '@components/sidebar/History.scss';
import { useEffect, useState } from 'react';
import {
  getHistory,
  getPlacesWithUserBookmarks,
  getRestaurantsWithName,
} from '@src/lib/api/supabase_api';
import { useTodayRestaurantDispatch } from '@src/context/TodayRestaurantContext';
import { useBookMarkState } from '@src/context/BookMarkContext';
const History = ({ histories }: { histories: HistoryType }) => {
  const [historyRestaurants, setHistoryRestaurants] = useState<any[]>([]);
  const todayRestaurantDispatch = useTodayRestaurantDispatch();
  const { userId } = useBookMarkState();

  useEffect(() => {
    const fetchHistory = async () => {
      // const response = await getHistory('ltjktnet12', 'desc');
      const response = await getPlacesWithUserBookmarks(userId);
      setHistoryRestaurants(response);
    };
    fetchHistory();
    console.log('historyRestaurants', historyRestaurants);
  }, [histories]);

  return (
    <div className="history-container">
      <div className="restaurant-card-container">
        {historyRestaurants.map((restaurant) => {
          return (
            <>
              <RestaurantCard
                key={restaurant.id}
                restaurant={{
                  place_name: restaurant.place_name,
                  category_name: restaurant.category_name,
                  address: restaurant.address,
                  period: restaurant.period,
                  // position:restaurant.position,
                  visit: restaurant.visit_date,
                  place_url: restaurant.place_url,
                  bookmarked: restaurant.bookmarked,
                }}
                visitDate={restaurant.visit_date}
              />
            </>
          );
        })}
      </div>
    </div>
  );
};

export default History;
