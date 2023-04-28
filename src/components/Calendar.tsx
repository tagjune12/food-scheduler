import { useRef } from 'react';
import '@components/Calendar.scss';

type HeaderProps = {
  year: number;
  month: number;
};

const Header = ({ year, month }: HeaderProps) => {
  return (
    <div>
      <h3>{year}</h3>
      <h2>{month}월</h2>
    </div>
  );
};

const Days = () => {
  const days = useRef<string[]>([
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ]);
  return (
    <div>
      {days.current.map((day) => (
        <div key={day}>{day}</div>
      ))}
    </div>
  );
};

type BodyProps = {
  date: number;
};
const Body = ({ date }: BodyProps) => {
  const cells = useRef<number[]>(
    Array.from(Array(date), (_, index) => index + 1),
  );

  return (
    <>
      {cells.current.map((value) => (
        <CalendarCell key={value} date={value} />
      ))}
    </>
  );
};

type CalendarCellProps = {
  date: number;
  event?: any;
};
const CalendarCell = ({ date, event }: CalendarCellProps) => {
  return <div>{date}</div>;
};

const Calendar = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  // const date = today.getDate();
  const maxDate = new Date(year, month, 0).getDate();

  return (
    <div className="calendar-container">
      <Header year={year} month={month} />
      <Days />
      <Body date={maxDate} />
    </div>
  );
};

export default Calendar;
