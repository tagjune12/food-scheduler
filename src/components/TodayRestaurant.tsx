import RestaurantCard from '@components/commons/RestaurantCard';
import { Restaurant } from '@src/types';
import { useEffect, useState } from 'react';
import { getNumTypeToday } from '@lib/util';
import '@components/TodayRestaurant.scss';
import { PiBowlFood } from 'react-icons/pi';

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
    <div className="today-restaurant-contianer">
      <h3 className="title">{`${visit.month}월${visit.date}일`} 팀점은</h3>
      {restaurant.name ? (
        <div>
          {' '}
          <PiBowlFood />
          {restaurant.name}
        </div>
      ) : (
        '어디로 가지...?'
      )}
    </div>
  );
};

export default TodayRestaurant;
