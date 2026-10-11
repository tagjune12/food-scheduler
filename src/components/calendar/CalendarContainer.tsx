import Calendar from './Calendar';
import useVisitCalendar from './useVisitCalendar';

export default function CalendarContainer({
  closeCalendar,
}: {
  closeCalendar: () => void;
}) {
  const {
    events,
    handleDatesSet,
    handleEventClick,
    handleEventDrop,
    onVisitAdded,
  } = useVisitCalendar();

  return (
    <Calendar
      initailEvents={events}
      handleDatesSet={handleDatesSet}
      closeCalendar={closeCalendar}
      handleEventClick={handleEventClick}
      handleEventDrop={handleEventDrop}
      onRestaurantListCallback={onVisitAdded}
    />
  );
}
