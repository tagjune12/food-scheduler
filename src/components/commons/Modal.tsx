import { Restaurant, JSONResponse } from '@src/types';
import { getHistory, insertEvent, updateEvent } from '@lib/api/calendar_api';
import '@components/commons/Modal.scss';
import { useModalDispatch, useModalState } from '@src/context/ModalContext';
import {
  useTodayRestaurantDispatch,
  useTodayRestaurantState,
} from '@src/context/TodayRestaurantContext';
import { insertHistory } from '@lib/api/supabase_api';
import { useRef } from 'react';
import { useBookMarkState } from '@src/context/BookMarkContext';

const Modal = ({ restaurant }: { restaurant: Restaurant }) => {
  const modalDispatch = useModalDispatch();
  const modalState = useModalState();
  const todayRestaurantDispatch = useTodayRestaurantDispatch();
  const todayRestaurantState = useTodayRestaurantState();
  const calendarEvent = useRef<any>(null);
  const { userId } = useBookMarkState();

  const insertTodayRestaurant = () => {
    try {
      insertEvent(restaurant.name, new Date()).then((result) => {
        // console.log('todayRestaurantState1-restaurant', restaurant);
        todayRestaurantDispatch({
          type: 'selectRestaurant',
          payload: { ...restaurant },
        });
        calendarEvent.current = result;
        // console.log('todayRestaurantState1', todayRestaurantState);
        // console.log('result', result);
        // console.log('calendarEvent1', calendarEvent.current);
        if (modalState.callbackFn) {
          modalState.callbackFn(calendarEvent.current);
        }
        modalDispatch({ type: 'hideModal' });
        insertHistory(
          userId,
          restaurant.name,
          result.start.date,
          result.id,
          'day',
        );
      });
    } catch (error) {
      alert('일정 추가에 실패했습니다.');
    }
  };

  const updateTodayRestaurant = (todayEvent: JSONResponse) => {
    try {
      updateEvent(restaurant.name, todayEvent.id, new Date()).then((result) => {
        // console.log('todayRestaurantState2-restaurant', restaurant);
        todayRestaurantDispatch({
          type: 'selectRestaurant',
          payload: { ...restaurant },
        });
        calendarEvent.current = result;
        // console.log('todayRestaurantState1', todayRestaurantState);
        // console.log('result', result);
        // console.log('calendarEvent2', calendarEvent.current);
        if (modalState.callbackFn) {
          modalState.callbackFn(calendarEvent.current);
        }

        modalDispatch({ type: 'hideModal' });
        // console.log('todayRestaurantState2', todayRestaurantState);
        // updateHistory(
        //   'ltjktnet12',
        //   restaurant.name,
        //   todayEvent.start.date,
        //   todayEvent.id,
        //   'day',
        // );
        insertHistory(
          userId,
          restaurant.name,
          todayEvent.start.date,
          todayEvent.id,
          'day',
        );
      });
    } catch (error) {
      alert('일정 업데이트에 실패했습니다.');
    }
  };

  // 이미 등록된게 있으면 업데이트 아니면 추가
  const onSaveBtnClickListener = async () => {
    const data: JSONResponse[] = (await getHistory()).items;
    if (data.length > 0) {
      updateTodayRestaurant(data[0]);
    } else {
      insertTodayRestaurant();
    }
  };

  const hideModal = () => {
    modalDispatch({ type: 'hideModal' });
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
