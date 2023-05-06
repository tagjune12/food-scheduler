import '@components/commons/RestaurantCard.scss';
import { Restaurant } from '@src/types';
// import { UseDispatch } from '@src/App';
import { useContext, useState } from 'react';
import Modal from '@components/commons/Modal';
import { UseDispatch } from '@src/App';

type RestaurantCardProps = {
  restaurant: Restaurant;
  visitDate?: string;
};

const RestaurantCard = ({ restaurant, visitDate }: RestaurantCardProps) => {
  const dispatch = useContext(UseDispatch);

  const onBtnClick = () => {
    dispatch({ type: 'showModal', payload: restaurant });
  };

  return (
    <>
      <div className="card-container">
        <h3>{restaurant.name}</h3>
        <div>{visitDate ?? '없음'}</div>
        <div className="progress-wrapper">
          <progress value={15} max={30} />
          {/*max 다른 값으로 바꿀것*/}
        </div>
        {
          <div className="tag-container">
            {restaurant.tags?.map((tag, index) => (
              <p key={index} className="tag">
                {tag}
              </p>
            ))}
          </div>
        }
        <button onClick={onBtnClick}>오늘은 이거다</button>
      </div>
    </>
  );
};

export default RestaurantCard;
