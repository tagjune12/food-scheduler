import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  EventClickArg,
  EventContentArg,
  EventDropArg,
  DatesSetArg,
  EventInput,
} from '@fullcalendar/core';
import type { VisitWithPlace } from '@src/types';
import RestaurantList from './RestaurantListContainer';
import '@components/calendar/Calendar.scss';

export interface CalendarProps {
  initailEvents?: EventInput[];
  handleDatesSet: (dateInfo: DatesSetArg) => void;
  closeCalendar: () => void;
  handleEventClick: (clickInfo: EventClickArg) => void;
  handleEventDrop: (dragInfo: EventDropArg) => void;
  onRestaurantListCallback: (visit: VisitWithPlace) => void;
}

const Calendar = ({
  initailEvents,
  handleDatesSet,
  closeCalendar,
  handleEventClick,
  handleEventDrop,
  onRestaurantListCallback,
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
    <div className="calendar-wrapper">
      <div className="calendar-and-list-container">
        <div className="calendar-container">
          <FullCalendar
            datesSet={handleDatesSet}
            customButtons={{
              closeButton: {
                text: 'X',
                click: closeCalendar,
              },
            }}
            plugins={[dayGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: '',
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
          />
        </div>
        <RestaurantList
          callbackFn={onRestaurantListCallback}
        />
      </div>
    </div>
  );
};

export default Calendar;
