import { useContext, useEffect, useState } from 'react';
import {
  getRestaurants,
  getRestaurantsWithPagination,
} from '@lib/api/supabase_api';
import PaginationButtons from '@components/commons/PaginationButtons';
import { UseDispatch } from '@src/App';
import { convertPlaceToRestaurant } from '@lib/util';
import { useModalDispatch } from '@src/context/ModalContext';

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const [sortType, setSortType] = useState<string>('name');
  const dataPerPage = 10;
  // const dispatch = useContext(UseDispatch);
  const modalDispatch = useModalDispatch();

  useEffect(() => {
    // supabase에서 데이터 가져오기
    (async () => {
      setIsLoading(true);
      try {
        const restaurants = await getRestaurants();
        setRestaurants(restaurants);
      } catch (error) {
        console.error('레스토랑 데이터 로딩 오류:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleRestaurantListItemClick = (event: React.MouseEvent) => {
    // 클릭된 요소를 시작으로 부모 요소 중 restaurant-item 클래스를 가진 요소를 찾음
    const target = event.target as HTMLElement;
    const restaurantItem = target.closest('.restaurant-item') as HTMLElement;

    // restaurant-item을 찾았다면 해당 데이터를 처리
    if (restaurantItem && restaurantItem.dataset.restaurant) {
      const restaurant = JSON.parse(restaurantItem.dataset.restaurant);
      console.log('선택된 레스토랑:', restaurant);
      // 여기에 레스토랑 선택 처리 로직 추가
      modalDispatch({
        type: 'showModal',
        payload: convertPlaceToRestaurant(
          JSON.parse(restaurantItem.dataset.restaurant),
        ),
      });
    }
  };

  const handleSortClick = (sortType: string) => {
    console.log('정렬 타입:', sortType);
    setSortType(sortType);
    // if (restaurants) {
    //   if (sortType === 'name') {
    //     restaurants.sort((a, b) => a.place_name.localeCompare(b.name));
    //   } else if (sortType === 'visit_date') {
    //     restaurants.sort(
    //       (a, b) =>
    //         new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime(),
    //     );
    //   }
    // }
  };

  return (
    <div className="restaurant-list-container">
      <div className="restaurant-list-header">
        <h3>식당 목록</h3>
        <div className="restaurant-list-header-sort-container">
          <div className="restaurant-list-header-sort">
            <p
              onClick={() => handleSortClick('name')}
              className={sortType === 'name' ? 'selected' : ''}
            >
              이름 순
            </p>
            <p
              onClick={() => handleSortClick('visit_date')}
              className={sortType === 'visit_date' ? 'selected' : ''}
            >
              최근 방문일자 순
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-indicator">데이터를 불러오는 중...</div>
      ) : restaurants.length > 0 ? (
        <>
          <div
            className="restaurant-items-container"
            onClick={handleRestaurantListItemClick}
          >
            {restaurants
              .slice((page - 1) * dataPerPage, page * dataPerPage)
              .map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="restaurant-item"
                  data-restaurant={JSON.stringify(restaurant)}
                >
                  <div className="place-name">{restaurant.place_name}</div>
                  <div className="category-name">
                    {restaurant.category_name}
                  </div>
                  <div className="visit-date">{restaurant.visit_date}</div>
                </div>
              ))}
          </div>

          <div className="pagination-container">
            <PaginationButtons
              page={page}
              dataPerPage={dataPerPage}
              totalDataLength={restaurants.length}
              btnClickListener={setPage}
            />
          </div>
        </>
      ) : (
        <div className="no-data-message">표시할 레스토랑이 없습니다.</div>
      )}
    </div>
  );
}
