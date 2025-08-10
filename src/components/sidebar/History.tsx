import RestaurantCard from '@components/commons/RestaurantCard';
import { HistoryType } from '@src/types';
import '@components/sidebar/History.scss';
import { useEffect, useState } from 'react';
import { getPlacesWithUserBookmarks } from '@src/lib/api/supabase_api';
import { useBookMarkState } from '@src/context/BookMarkContext';
const History = ({ histories }: { histories: HistoryType }) => {
  const [historyRestaurants, setHistoryRestaurants] = useState<any[]>([]);
  const { userId } = useBookMarkState();

  useEffect(() => {
    const fetchHistory = async () => {
      const response = await getPlacesWithUserBookmarks(userId);
      setHistoryRestaurants(response);
    };
    fetchHistory();
  }, [histories, userId]);

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
