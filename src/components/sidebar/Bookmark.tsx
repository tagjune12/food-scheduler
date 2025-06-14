import RestaurantCard from '@components/commons/RestaurantCard';
import { deleteBookmark, getBookmarks } from '@lib/api/supabase_api';
import { useEffect, useState } from 'react';

export const Bookmark = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    const userId = 'ltjktnet12';
    const fetchBookmarks = async () => {
      const bookmarks = await getBookmarks(userId);
      console.log('bookmarks', bookmarks);
      setBookmarks(bookmarks);
    };
    fetchBookmarks();
  }, []);

  const handleBookmarkClick = async (restaurantId: string) => {
    console.log('bookmark clicked', restaurantId);
    const result = await deleteBookmark('ltjktnet12', restaurantId);
    console.log('result', result);
    if (result.length === 0) return;

    const filteredBookmarks = bookmarks.filter(
      (bookmark) => bookmark.id !== restaurantId,
    );
    setBookmarks([...filteredBookmarks]);
  };

  return (
    <div>
      {/* <h1>Bookmark</h1> */}
      {bookmarks.map((restaurant) => {
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
                id: restaurant.id,
              }}
              visitDate={restaurant.visit_date}
              callback={handleBookmarkClick}
            />
          </>
        );
      })}
    </div>
  );
};
