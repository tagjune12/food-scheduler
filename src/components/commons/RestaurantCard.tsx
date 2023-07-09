import '@components/commons/RestaurantCard.scss';
import { Restaurant } from '@src/types';
import { useContext, useState } from 'react';
import { UseDispatch } from '@src/App';
import { getNumTypeToday } from '@lib/util';

type RestaurantCardProps = {
  restaurant: Restaurant;
  visitDate?: string;
};

const RestaurantCard = ({ restaurant, visitDate }: RestaurantCardProps) => {
  const dispatch = useContext(UseDispatch);

  const getDiffDate = (visitDate: string): number => {
    const today = getNumTypeToday();
    const visit = (() => {
      const temp = visitDate.split('-');

      return {
        year: parseInt(temp[0]),
        month: parseInt(temp[1]),
        date: parseInt(temp[2]),
      };
    })();

    const diffMs =
      new Date(today.year, today.month, today.date).getTime() -
      new Date(visit.year, visit.month, visit.date).getTime();

    console.log(
      restaurant.name,
      ':',
      today,
      visit,
      diffMs / (1000 * 60 * 60 * 24),
    );

    return diffMs / (1000 * 60 * 60 * 24);
  };

  const onBtnClick = () => {
    dispatch({ type: 'showModal', payload: restaurant });
  };

  return (
    <>
      <div className="card-container">
        <h3>{restaurant.name}</h3>
        <div>
          {visitDate
            ? `${getDiffDate(visitDate)}일전 방문`
            : '최근 방문한적 없음'}
        </div>
        <div className="progress-wrapper">
          <progress value={visitDate ? getDiffDate(visitDate) : 0} max={28} />
        </div>
        {
          <div id="tags">
            {/* <button>{'<'}</button> */}
            <div className="tag-container">
              {restaurant.tags?.map((tag, index) => (
                <div key={index} className="tag">
                  {tag}
                </div>
              ))}
            </div>
            {/* <button>{'>'}</button> */}
          </div>
        }
        <button onClick={onBtnClick}>오늘은 이거다</button>
      </div>
    </>
  );
};

export default RestaurantCard;
