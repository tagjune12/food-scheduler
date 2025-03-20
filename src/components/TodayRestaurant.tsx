// import RestaurantCard from '@components/commons/RestaurantCard';
import { Restaurant } from '@src/types';
import { useEffect, useRef, useState } from 'react';
import { getNumTypeToday } from '@lib/util';
import '@components/TodayRestaurant.scss';
import { PiBowlFood } from 'react-icons/pi';
import { BsQuestionLg } from 'react-icons/bs';

interface TodayRestaurantProps {
  restaurantName: string;
}

const TodayRestaurant = ({ restaurantName }: TodayRestaurantProps) => {
  const visit = useRef<{
    year: number;
    month: number;
    date: number;
  }>(getNumTypeToday());

  return (
    <div className="today-restaurant-contianer">
      <h3 className="title">
        {`${visit.current.month}월${visit.current.date}일`} 팀점은
      </h3>
      <div className="info-section">
        {restaurantName ? (
          <div>
            {' '}
            <PiBowlFood />
            {restaurantName}
          </div>
        ) : (
          // <BsQuestionLg id="questionMark" />
          <div>몰?루</div>
        )}
      </div>
    </div>
  );
};

export default TodayRestaurant;
