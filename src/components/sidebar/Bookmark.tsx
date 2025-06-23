import RestaurantCard from '@components/commons/RestaurantCard';
import { deleteBookmark, getBookmarks } from '@lib/api/supabase_api';
import { BookmarkSharp } from '@mui/icons-material';
import {
  useBookMarkActions,
  useBookMarkState,
} from '@src/context/BookMarkContext';
import { useEffect, useState } from 'react';

export const Bookmark = () => {
  // const [bookmarks, setBookmarks] = useState<any[]>([]);
  const { bookmarks, loading, error } = useBookMarkState();
  const { removeBookmark } = useBookMarkActions();

  // useEffect(() => {
  //   const userId = 'ltjktnet12';
  //   const fetchBookmarks = async () => {
  //     const bookmarks = await getBookmarks(userId);
  //     console.log('bookmarks', bookmarks);
  //     setBookmarks(bookmarks);
  //   };
  //   fetchBookmarks();
  // }, []);

  useEffect(() => {
    console.log('bookmarks', bookmarks);
  }, [bookmarks]);

  const handleBookmarkClick = async (restaurantId: string) => {
    console.log('bookmark clicked', restaurantId);
    // const result = await deleteBookmark('ltjktnet12', restaurantId);
    // console.log('result', result);
    // if (result.length === 0) return;

    // const filteredBookmarks = bookmarks.filter(
    //   (bookmark) => bookmark.id !== restaurantId,
    // );
    // setBookmarks([...filteredBookmarks]);
    await removeBookmark(restaurantId);
  };

  return (
    <div>
      {/* <h1>Bookmark</h1> */}
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
                  // position:restaurant.position,
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
