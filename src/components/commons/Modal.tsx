import React from 'react';

type ModalProps = {
  insertSchedule: () => void;
  updateSchedule: () => void;
  hideModal: Function;
};

const Modal = ({ insertSchedule, updateSchedule, hideModal }: ModalProps) => {
  const onSaveBtnClickListener = () => {
    // insert
    // update
  };

  return (
    <div>
      <h2>저장</h2>
      <button onClick={hideModal(false)}>X</button>
      <p>정말 이대로 저장하시겠습니까?</p>
      <button onClick={onSaveBtnClickListener}>예</button>
      <button onClick={hideModal(false)}>아니오</button>
    </div>
  );
};

export default Modal;
