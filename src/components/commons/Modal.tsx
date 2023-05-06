import { useContext } from 'react';
import { Restaurant, JSONResponse } from '@src/types';
import { UseDispatch } from '@src/App';
import { getHistory, insertEvent, updateEvent } from '@lib/api/calendar_api';
import '@components/commons/Modal.scss';

type ModalProps = {
  restaurant: Restaurant;
};

const Modal = ({ restaurant }: ModalProps) => {
  const dispatch = useContext(UseDispatch);

  const insertTodayRestaurant = () => {
    try {
      insertEvent(restaurant.name, new Date()).then(() => {
        dispatch({ type: 'selectRestaurant', payload: { ...restaurant } });
        dispatch({ type: 'hideModal' });
      });
    } catch (error) {
      alert('일정 추가에 실패했습니다.');
      console.log(error);
    }
  };

  const updateTodayRestaurant = (todayEvent: JSONResponse) => {
    try {
      updateEvent(restaurant.name, todayEvent.id, new Date()).then(() => {
        dispatch({ type: 'selectRestaurant', payload: { ...restaurant } });
        dispatch({ type: 'hideModal' });
      });
    } catch (error) {
      alert('일정 업데이트에 실패했습니다.');
      console.log(error);
    }
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
    dispatch({ type: 'hideModal' });
  };

  return (
    <div className="modal-wrapper">
      <div className="modal-container">
        <button className="close-btn" onClick={hideModal}>
          X
        </button>
        <h2 className="title">저장</h2>
        <p>정말 이대로 저장하시겠습니까?</p>
        <div>{restaurant.name}</div>
        <div className="btn-container">
          <button onClick={onSaveBtnClickListener}>예</button>
          <button onClick={hideModal}>아니오</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
