import React from 'react';
import Searchbar from '@components/commons/Searchbar';
import PaginationButtons from '@components/commons/PaginationButtons';

interface RestaurantListProps {
  restaurants: any[];
  isLoading: boolean;
  page: number;
  dataPerPage: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setRestaurants: React.Dispatch<React.SetStateAction<any[]>>;
  onRestaurantClick: (event: React.MouseEvent) => void;
  restaurantListRef: React.RefObject<HTMLDivElement>;
}

function ListItem({ restaurant }: { restaurant: any }) {
  return (
    <div
      key={restaurant.id}
      className="restaurant-item"
      data-restaurant={JSON.stringify(restaurant)}
    >
      <div className="place-name">{restaurant.place_name}</div>
      <div className="category-name">{restaurant.category_name}</div>
      <div className="visit-date">{restaurant.visit_date}</div>
    </div>
  );
}

export default function RestaurantList({
  restaurants,
  isLoading,
  page,
  dataPerPage,
  setPage,
  setRestaurants,
  onRestaurantClick,
  restaurantListRef,
}: RestaurantListProps) {
  return (
    <div className="restaurant-list-container">
      <div className="restaurant-list-header">
        <h3>식당 목록</h3>
        <Searchbar callbackFn={setRestaurants} />

        <div className="restaurant-list-header-sort-container">
          <div className="restaurant-list-header-sort"></div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-indicator">데이터를 불러오는 중...</div>
      ) : restaurants.length > 0 ? (
        <>
          <div
            className="restaurant-items-container"
            onClick={onRestaurantClick}
            ref={restaurantListRef}
          >
            {restaurants
              .slice((page - 1) * dataPerPage, page * dataPerPage)
              .map((restaurant) => (
                <ListItem key={restaurant.id} restaurant={restaurant} />
              ))}
          </div>

          <div className="pagination-container">
            <PaginationButtons
              page={page}
              dataPerPage={dataPerPage}
              totalDataLength={restaurants.length}
              btnClickListener={setPage}
              restaurantListRef={restaurantListRef}
            />
          </div>
        </>
      ) : (
        <div className="no-data-message">표시할 레스토랑이 없습니다.</div>
      )}
    </div>
  );
}