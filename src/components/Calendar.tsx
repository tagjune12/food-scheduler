import React, { useRef } from 'react';

const CalendarCell = () => {
  return <div>Cell</div>;
};

const Calendar = () => {
  const count = useRef<number>(30);

  return (
    <>
      <div>달력</div>
    </>
  );
};

export default Calendar;
