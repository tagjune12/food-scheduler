import { useContext } from 'react';
import { Restaurant, JSONResponse } from '@src/types';
import { UseDispatch } from '@src/App';
import { getHistory, insertEvent, updateEvent } from '@lib/api/calendar_api';
import { ImCancelCircle } from 'react-icons/im';
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
    }
  };

  const onSaveBtnClickListener = async () => {
    const data: JSONResponse[] = (await getHistory()).items;
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
        {/* <ImCancelCircle className="close-btn" onClick={hideModal} /> */}
        <h2 className="title">오늘의 식당 선택</h2>
        <p>선택하신 식당을 오늘의 식당으로 저장하시겠습니까?</p>
        <div className="name">{restaurant.name}</div>
        <div className="btn-container">
          <button className="yes" onClick={onSaveBtnClickListener}>
            확인
          </button>
          <button className="no" onClick={hideModal}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
