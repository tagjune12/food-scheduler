import React, { useState } from 'react';
import PaginationButtons from '@components/commons/PaginationButtons';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import SearchIcon from '@mui/icons-material/Search';
import { searchRestaurantwithName } from '@lib/api/supabase_api';

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
  // Mock tags and rating if not present for layout matching
  const tags = restaurant.category_name 
    ? restaurant.category_name.split(' > ').slice(0, 2) 
    : ['Family Friendly', 'Local Favorite'];
    
  // Mock rating
  const rating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);

  // Category based icon
  const isCafe = restaurant.category_group_code === 'CE7' || (restaurant.category_name && restaurant.category_name.includes('카페'));

  return (
    <div
      key={restaurant.id}
      className="mobile-restaurant-item"
      data-restaurant={JSON.stringify(restaurant)}
    >
      {/* <div className="restaurant-icon-container">
        {isCafe ? <LocalCafeIcon className="restaurant-icon" /> : <RestaurantIcon className="restaurant-icon" />}
      </div> */}
      <div className="restaurant-info">
        <div className="info-header">
          <div className="place-name">{restaurant.place_name}</div>
          {/* <div className="rating-badge">{rating}</div> */}
        </div>
        <div className="category-location">
          {tags[0]} {tags[1] && ` • ${tags[1]}`}
        </div>
        {/* <div className="tags-container">
          <span className="tag">Quiet</span>
          <span className="tag">Date Spot</span>
        </div> */}
      </div>
    </div>
  );
}

export default function MobileRestaurantList({
  restaurants,
  isLoading,
  page,
  dataPerPage,
  setPage,
  setRestaurants,
  onRestaurantClick,
  restaurantListRef,
}: RestaurantListProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchValue.length < 2) {
        alert('검색어는 2글자 이상이어야 합니다.');
        return;
      }
      const result = await searchRestaurantwithName(searchValue);
      setRestaurants(result);
    }
  };

  return (
    <div className="mobile-restaurant-list-container">
      <div className="mobile-restaurant-list-header">
        <h3>식당 목록</h3>
        <div className="custom-search-container">
          <SearchIcon className="search-icon" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-indicator">데이터를 불러오는 중...</div>
      ) : restaurants.length > 0 ? (
        <>
          <div
            className="mobile-restaurant-items-container"
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
              isMobile={true}
            />
          </div>
        </>
      ) : (
        <div className="no-data-message">표시할 레스토랑이 없습니다.</div>
      )}
    </div>
  );
}
