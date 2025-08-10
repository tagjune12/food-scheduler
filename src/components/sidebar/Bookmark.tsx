import RestaurantCard from '@components/commons/RestaurantCard';
import {
  useBookMarkActions,
  useBookMarkState,
} from '@src/context/BookMarkContext';
import { useEffect } from 'react';

export const Bookmark = () => {
  const { bookmarks } = useBookMarkState();
  const { removeBookmark } = useBookMarkActions();

  useEffect(() => {}, [bookmarks]);

  const handleBookmarkClick = async (restaurantId: string) => {
    await removeBookmark(restaurantId);
  };

  return (
    <div>
      {bookmarks.length === 0 ? (
        <div>즐겨찾기가 없습니다.</div>
      ) : (
        bookmarks.map((restaurant) => {
          return (
            <>
              <RestaurantCard
                key={restaurant.id}
                restaurant={{
                  place_name: restaurant.place_name,
                  category_name: restaurant.category_name,
                  address: restaurant.address_name,
                  period: null,
                  visit: null,
                  place_url: restaurant.place_url,
                  id: restaurant.id,
                }}
                visitDate={undefined}
                callback={handleBookmarkClick}
              />
            </>
          );
        })
      )}
    </div>
  );
};
