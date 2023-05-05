import { useContext, useState } from 'react';
import { NestObjType, Restaurant, JSONResponse } from '@src/types';
import { UseDispatch } from '@src/App';
import { getHistory, insertEvent, updateEvent } from '@lib/api/calendar_api';

type ModalProps = {
  restaurant: Restaurant;
  setShowModal: Function;
};

const Modal = ({ restaurant, setShowModal }: ModalProps) => {
  const dispatch = useContext(UseDispatch);
  const insertTodayRestaurant = () => {
    dispatch({ type: 'selectRestaurant', payload: { ...restaurant } });
    insertEvent(restaurant.name, new Date());
    setShowModal(false);
  };

  const updateTodayRestaurant = (todayEvent: JSONResponse) => {
    updateEvent(restaurant.name, todayEvent.id, new Date());
  };

  const onSaveBtnClickListener = async () => {
    const data: JSONResponse[] = (await getHistory()).items;
    console.log('onSaveBtnClickListener', data);
    if (data.length > 0) {
      updateTodayRestaurant(data[0]);
    } else {
      insertTodayRestaurant();
    }
  };

  const hideModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <h2>저장</h2>
      <button onClick={hideModal}>X</button>
      <p>정말 이대로 저장하시겠습니까?</p>
      <button onClick={onSaveBtnClickListener}>예</button>
      <button onClick={hideModal}>아니오</button>
    </div>
  );
};

export default Modal;
