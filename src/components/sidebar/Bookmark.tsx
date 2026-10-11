import RestaurantCard from '@components/commons/RestaurantCard';
import {
  useBookMarkActions,
  useBookMarkState,
} from '@src/context/BookMarkContext';

// 북마크 목록은 BookmarkProvider가 로그인 사용자가 바뀔 때 조회하므로 여기서는 상태만 읽는다
export const Bookmark = () => {
  const { bookmarks } = useBookMarkState();
  const { removeBookmark } = useBookMarkActions();

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
