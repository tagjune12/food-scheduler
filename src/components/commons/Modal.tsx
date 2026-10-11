import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Restaurant } from '@src/types';
import { addVisit } from '@lib/api/visit_api';
import { toLocalDateString } from '@lib/util';
import { useModalDispatch, useModalState } from '@src/context/ModalContext';
import { useAuth } from '@src/context/AuthContext';
import '@components/commons/Modal.scss';

const Modal = ({ restaurant }: { restaurant: Restaurant }) => {
  const modalDispatch = useModalDispatch();
  const modalState = useModalState();
  const { isLogin } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const hideModal = () => {
    modalDispatch({ type: 'hideModal' });
  };

  const onSaveBtnClickListener = async () => {
    if (!isLogin) {
      if (window.confirm('로그인이 필요합니다. 로그인하시겠습니까?')) {
        hideModal();
        navigate('/login', { replace: true });
      }
      return;
    }
    if (!restaurant.id) {
      alert('식당 정보를 찾을 수 없습니다.');
      return;
    }

    setIsSaving(true);
    const visit = await addVisit(restaurant.id, toLocalDateString(new Date()));
    setIsSaving(false);

    if (!visit) {
      alert('일정 추가에 실패했습니다.');
      return;
    }
    modalState.callbackFn?.(visit);
    hideModal();
  };

  return (
    <div className="modal-wrapper">
      <div className="modal-container">
        <h2 className="title">오늘 방문 일정 추가</h2>
        <p>선택하신 식당을 오늘 방문 일정에 추가하시겠습니까?</p>
        <div className="name">{restaurant.name}</div>
        <div className="btn-container">
          <button className="yes" onClick={onSaveBtnClickListener} disabled={isSaving}>
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
