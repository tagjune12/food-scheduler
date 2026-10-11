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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { IconButton } from '@mui/material';
import type { VisitWithPlace } from '@src/types';
import MobileRestaurantList from './MobileRestaurantListContainer';
import './MobileCalendar.scss';

export interface CalendarProps {
  initailEvents?: EventInput[];
  handleDatesSet: (dateInfo: DatesSetArg) => void;
  closeCalendar: () => void;
  handleEventClick: (clickInfo: EventClickArg) => void;
  handleEventDrop: (dragInfo: EventDropArg) => void;
  onRestaurantListCallback: (visit: VisitWithPlace) => void;
}

const MobileCalendar = ({
  initailEvents,
  handleDatesSet,
  closeCalendar,
  handleEventClick,
  handleEventDrop,
  onRestaurantListCallback,
}: CalendarProps) => {

  const renderEventContent = (eventContent: EventContentArg) => {
    return (
      <div className="mobile-calendar-event-content">
        <span className="mobile-calendar-event-text">{eventContent.event.title}</span>
      </div>
    );
  };

  return (
    <div className="mobile-calendar-wrapper">
      <div className="mobile-calendar-header">
        <IconButton onClick={closeCalendar} aria-label="back" className="mobile-back-btn">
          <ArrowBackIosNewIcon />
        </IconButton>
      </div>
      <div className="mobile-calendar-and-list-container">
        <div className="mobile-calendar-container">
          <FullCalendar
            datesSet={handleDatesSet}
            plugins={[dayGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev',
              center: 'title',
              right: 'next',
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
            contentHeight="auto"
          />
        </div>
        <MobileRestaurantList
          callbackFn={onRestaurantListCallback}
        />
      </div>
    </div>
  );
};

export default MobileCalendar;
