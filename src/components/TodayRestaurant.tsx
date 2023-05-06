import RestaurantCard from '@components/commons/RestaurantCard';
import { Restaurant } from '@src/types';
import { useEffect, useState } from 'react';
import { getNumTypeToday } from '@lib/util';

type props = {
  restaurant: Restaurant;
};

const TodayRestaurant = ({ restaurant }: props) => {
  const [visit, setVisit] = useState<{
    year: number;
    month: number;
    date: number;
  }>(getNumTypeToday());

  return (
    <>
      <h3>{`${visit.month}월${visit.date}일`} 팀점은</h3>
      {restaurant.name ? <div>{restaurant.name}</div> : '어디로 가지...?'}
    </>
  );
};

export default TodayRestaurant;
