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
import './MobileCalendar.scss';
import MobileRestaurantList from './MobileRestaurantListContainer';
import CalendarListModal from './CalendarListModalContainer';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { IconButton } from '@mui/material';

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

const MobileCalendar = ({
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
      <div className="mobile-calendar-event-content">
        <span className="mobile-calendar-event-text">{eventContent.event.title}</span>
      </div>
    );
  };

  return (
    <>
      <div className="mobile-calendar-wrapper">
        <div className="mobile-calendar-header">
          <IconButton onClick={closeCalendar} aria-label="back" className="mobile-back-btn">
            <ArrowBackIosNewIcon />
          </IconButton>
        </div>
        <div className="mobile-calendar-and-list-container">
          <div className="mobile-calendar-container">
            <FullCalendar
              ref={calendarRef}
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
              eventsSet={handleEvents}
            />
          </div>
          <MobileRestaurantList
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

export default MobileCalendar;
