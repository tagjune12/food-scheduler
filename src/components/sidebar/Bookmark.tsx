import RestaurantCard from '@components/commons/RestaurantCard';
import {
  useBookMarkActions,
  useBookMarkState,
} from '@src/context/BookMarkContext';
import { useEffect } from 'react';
import {useAuth} from "@src/context/AuthContext";

export const Bookmark = () => {
  const { bookmarks } = useBookMarkState();
  const { removeBookmark, fetchBookmarks } = useBookMarkActions();
  const { isLogin, setIsLogin } = useAuth();

  useEffect(() => {
    if(isLogin){
      try{
        fetchBookmarks();
      }catch(e){
        alert("북마크를 가져오는데 실패했습니다.")
      }
    }
  }, [bookmarks]);

  const handleBookmarkClick = async (restaurantId: string) => {
    await removeBookmark(restaurantId);
  };

  return (

    <div className="schedule-header">
      <h2>즐겨찾기</h2>
      {bookmarks.length === 0 ? (
        <div>즐겨찾기가 없습니다.</div>
      ) : (
          <>
            {
              bookmarks.map((restaurant) => {
                return (
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
                );
              })
            }
          </>
      )}
    </div>
  );
};
