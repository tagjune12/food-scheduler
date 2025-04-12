import React, { useContext, useEffect, useState } from 'react';
import {
  EventApi,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  formatDate,
} from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { setInitializeEvents, createEventId } from '@lib/event-utils';
import { EventInput } from '@fullcalendar/core';
import { insertEvent, deleteEvent, updateEvent } from '@lib/api/calendar_api';
import '@components/Calendar.scss';
import { UseDispatch } from '@src/App';

const Calendar = ({ closeCalendar }: { closeCalendar: () => void }) => {
  // const [currentEvents, setCurrentEvents] = useState<EventApi[]>();
  const [initailEvents, setInitEvents] = useState<EventInput[]>();
  const dispatch = useContext(UseDispatch);

  // Date Cell 클릭시 이벤트 등록
  const handleDateSelect = async (selectInfo: DateSelectArg) => {
    let title = prompt('어디로 가지?');
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      try {
        const newEvent = await insertEvent(
          title,
          new Date(selectInfo.startStr),
        );
        calendarApi.addEvent({
          id: newEvent.id,
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay,
        });
      } catch (e) {
        alert('일정등록에 실패했습니다.');
      }

      // item.id
    }
  };

  // 일정 클릭하면 삭제할건지 뜸
  const handleEventClick = (clickInfo: EventClickArg) => {
    if (window.confirm(`일정을 삭제하시겠습니까? '${clickInfo.event.title}'`)) {
      try {
        const eventId = clickInfo.event._def.publicId;
        deleteEvent(eventId);
        clickInfo.event.remove();
        dispatch({ type: 'deleteEvent' });
      } catch (e) {
        // console.log('일정 삭제에 실패했습니다.');
      }
    }
  };

  // event HTML 컴포넌트 렌더링
  const renderEventContent = (eventContent: EventContentArg) => {
    return (
      <>
        <b>{eventContent.timeText}</b>
        <i>{eventContent.event.title}</i>
      </>
    );
  };

  const handleEventDrop = (dragInfo: EventDropArg) => {
    try {
      if (window.confirm('일정을 변경하시겠습니까?')) {
        updateEvent(
          dragInfo.event.title,
          dragInfo.event.id,
          new Date(dragInfo.event.start || new Date()),
        ).then(() => {
          alert('일정을 변경하였습니다.');
        });
      } else {
        dragInfo.revert();
      }
    } catch (e) {
      alert('일정 변경에 실패했습니다.');
    }
  };
  // const handleEvents = (events: EventApi[]) => {
  //   setCurrentEvents(events);
  // };

  useEffect(() => {
    (async () => {
      setInitEvents(await setInitializeEvents());
    })();
  }, []);

  return (
    <div className="calendar-wrapper">
      <div className="calendar-container">
        {initailEvents && (
          <FullCalendar
            customButtons={{
              closeButton: {
                text: 'X',
                click: () => {
                  closeCalendar();
                },
              },
            }}
            plugins={[dayGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev',
              center: 'title',
              right: 'next closeButton',
            }}
            initialView="dayGridMonth"
            // initialEvents={INITIAL_EVENTS} // alternatively, use the `events` setting to fetch from a feed
            initialEvents={initailEvents} // alternatively, use the `events` setting to fetch from a feed
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateSelect}
            eventContent={renderEventContent} // custom render function
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            // aspectRatio={1.3} // cell의 크기 조절
            handleWindowResize={true}
            contentHeight={600}
            // eventsSet={handleEvents} // called after events are initialized/added/changed/removed
          />
        )}
      </div>
    </div>
  );
};

export default Calendar;
