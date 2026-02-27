import React, { useState, useEffect, useRef } from 'react';
import RestaurantList from './RestaurantList';
import { getRestaurants } from '@lib/api/supabase_api';
import { useModalDispatch } from '@src/context/ModalContext';
import { convertPlaceToRestaurant } from '@lib/util';

export default function RestaurantListContainer({
  callbackFn,
}: {
  callbackFn: (params: any) => void;
}) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const dataPerPage = 10;
  const modalDispatch = useModalDispatch();
  const restaurantListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const fetchedRestaurants = await getRestaurants();
        setRestaurants(fetchedRestaurants);
      } catch (error) {
        console.error('레스토랑 데이터 로딩 오류:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleRestaurantListItemClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const restaurantItem = target.closest('.restaurant-item') as HTMLElement;

    if (restaurantItem && restaurantItem.dataset.restaurant) {
      modalDispatch({
        type: 'showModal',
        payload: convertPlaceToRestaurant(
          JSON.parse(restaurantItem.dataset.restaurant),
        ),
        callbackFn: callbackFn,
      });
    }
  };

  return (
    <RestaurantList
      restaurants={restaurants}
      isLoading={isLoading}
      page={page}
      dataPerPage={dataPerPage}
      setPage={setPage}
      setRestaurants={setRestaurants}
      onRestaurantClick={handleRestaurantListItemClick}
      restaurantListRef={restaurantListRef}
    />
  );
}
