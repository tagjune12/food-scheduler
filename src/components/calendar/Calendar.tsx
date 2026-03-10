import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  EventApi,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  DatesSetArg,
  EventInput,
} from '@fullcalendar/core';
import '@components/calendar/Calendar.scss';
import RestaurantList from './RestaurantListContainer';
import CalendarListModal from './CalendarListModalContainer';

export interface CalendarProps {
  calendarRef: React.RefObject<FullCalendar>;
  initailEvents?: EventInput[];
  handleDatesSet: (dateInfo: DatesSetArg) => void;
  closeCalendar: () => void;
  fetchGoogleCalendar: () => void;
  handleEventClick: (clickInfo: EventClickArg) => void;
  handleEventDrop: (dragInfo: EventDropArg) => void;
  handleEvents: (events: EventApi[]) => void;
  onRestaurantListCallback: (newEvent: any) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  setCurrentCalendarId: (id: string) => void;
  calendarList: any;
}

const Calendar = ({
  calendarRef,
  initailEvents,
  handleDatesSet,
  closeCalendar,
  fetchGoogleCalendar,
  handleEventClick,
  handleEventDrop,
  handleEvents,
  onRestaurantListCallback,
  isModalOpen,
  setIsModalOpen,
  setCurrentCalendarId,
  calendarList,
}: CalendarProps) => {

  const renderEventContent = (eventContent: EventContentArg) => {
    return (
      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <b>{eventContent.timeText}</b>
        <i style={{ marginLeft: eventContent.timeText ? '4px' : '0' }}>{eventContent.event.title}</i>
      </div>
    );
  };

  return (
    <>
      <div className="calendar-wrapper">
        <div className="calendar-and-list-container">
          <div className="calendar-container">
            <FullCalendar
              ref={calendarRef}
              datesSet={handleDatesSet}
              customButtons={{
                closeButton: {
                  text: 'X',
                  click: closeCalendar,
                },
                googleCalendarBtn: {
                  text: '📅 달력 가져오기',
                  click: fetchGoogleCalendar,
                },
              }}
              plugins={[dayGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'googleCalendarBtn',
                center: 'title',
                right: 'prev next closeButton',
              }}
              initialView="dayGridMonth"
              events={initailEvents}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              handleWindowResize={true}
              contentHeight={600}
              eventsSet={handleEvents}
            />
          </div>
          <RestaurantList
            callbackFn={onRestaurantListCallback}
          />
        </div>
      </div>
      <CalendarListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(id) => setCurrentCalendarId(id)}
        calendarList={calendarList}
      />
    </>
  );
};

export default Calendar;