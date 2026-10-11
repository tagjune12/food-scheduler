import MobileCalendar from './MobileCalendar';
import useVisitCalendar from './useVisitCalendar';

export default function MobileCalendarContainer({
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
    <MobileCalendar
      initailEvents={events}
      handleDatesSet={handleDatesSet}
      closeCalendar={closeCalendar}
      handleEventClick={handleEventClick}
      handleEventDrop={handleEventDrop}
      onRestaurantListCallback={onVisitAdded}
    />
  );
}
