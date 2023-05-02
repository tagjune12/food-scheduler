import '@components/commons/RestaurantCard.scss';
import { Restaurant } from '@src/types';
import { UseDispatch } from '@src/App';
import { useContext, useState } from 'react';
import { insertEvent } from '@api/calendar_api';
import Modal from '@components/commons/Modal';

type RestaurantCardProps = {
  restaurant: Restaurant;
  visit?: string;
  period?: number;
};

const RestaurantCard = ({ restaurant, period, visit }: RestaurantCardProps) => {
  const dispatch = useContext(UseDispatch);
  const [showModal, setShowModal] = useState<boolean>(false);

  const onBtnClick = () => {
    dispatch({ type: 'selectRestaurant', payload: { ...restaurant } });
    insertEvent(restaurant.name, new Date());
  };

  return (
    <>
      {showModal && (
        <Modal
          insertSchedule={() => {}}
          updateSchedule={() => {}}
          hideModal={setShowModal}
        />
      )}
      <div className="card-container">
        <h3>{restaurant.name}</h3>
        <div>{visit ?? '없음'}</div>
        <div className="progress-wrapper">
          <progress value={15} max={period} />
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
