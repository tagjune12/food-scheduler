import { useEffect, useRef, useState } from 'react';
import {
  EventApi,
  // DateSelectArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  // formatDate,
} from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { setInitializeEvents } from '@lib/event-utils';
import { EventInput } from '@fullcalendar/core';
import { deleteEvent, updateEvent } from '@lib/api/calendar_api';
import '@components/calendar/Calendar.scss';
// import { UseDispatch } from '@src/App';
import RestaurantList from '@components/calendar/RestaurantList';
import {
  useTodayRestaurantDispatch,
  useTodayRestaurantState,
} from '@src/context/TodayRestaurantContext';
// import { getStringTypeToday } from '@lib/util';

export default function Calendar({
  closeCalendar,
}: {
  closeCalendar: () => void;
}) {
  // const [currentEvents, setCurrentEvents] = useState<EventApi[]>();
  const [initailEvents, setInitEvents] = useState<EventInput[]>();
  // const dispatch = useContext(UseDispatch);
  const todayRestaurantDispatch = useTodayRestaurantDispatch();
  const { todayRestaurant } = useTodayRestaurantState();
  const calendarRef = useRef<FullCalendar>(null);

  // Date Cell 클릭시 이벤트 등록
  // const handleDateSelect = async (selectInfo: DateSelectArg) => {
  //   let title = prompt('어디로 가지?');
  //   let calendarApi = selectInfo.view.calendar;

  //   calendarApi.unselect(); // clear date selection

  //   if (title) {
  //     try {
  //       const newEvent = await insertEvent(
  //         title,
  //         new Date(selectInfo.startStr),
  //       );
  //       calendarApi.addEvent({
  //         id: newEvent.id,
  //         title,
  //         start: selectInfo.startStr,
  //         end: selectInfo.endStr,
  //         allDay: selectInfo.allDay,
  //       });
  //     } catch (e) {
  //       alert('일정등록에 실패했습니다.');
  //     }

  //     // item.id
  //   }
  // };

  // 레스토랑이 선택되었을 때 호출되는 함수
  // const handleRestaurantSelect = (restaurant) => {
  //   setSelectedRestaurant(restaurant);

  //   // 캘린더의 API에 접근해서 이벤트를 수동으로 업데이트할 수 있음
  //   if (calendarRef.current) {
  //     const calendarApi = calendarRef.current.getApi();
  //     // 여기서 필요한 작업 수행
  //     // 예: 새 이벤트 추가, 이벤트 업데이트 등

  //     // 모든 이벤트를 가져와서 eventsSet 콜백 수동 트리거
  //     const allEvents = calendarApi.getEvents();
  //     handleEvents(allEvents);
  //   }
  // };

  // 일정 클릭하면 삭제할건지 뜸
  const handleEventClick = (clickInfo: EventClickArg) => {
    if (window.confirm(`일정을 삭제하시겠습니까? '${clickInfo.event.title}'`)) {
      try {
        const eventId = clickInfo.event._def.publicId;
        deleteEvent(eventId);
        clickInfo.event.remove();
        todayRestaurantDispatch({ type: 'deleteEvent' });
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
  const handleEvents = (events: EventApi[]) => {
    console.log('events', events);
    // setCurrentEvents(events);
  };

  const initEvents = async () => {
    setInitEvents(await setInitializeEvents());
    console.log('initEvents', initailEvents);
    calendarRef.current?.getApi().refetchEvents();
  };

  useEffect(() => {
    initEvents();
  }, [todayRestaurant]);

  return (
    <div className="calendar-wrapper">
      <div className="calendar-and-list-container">
        <div className="calendar-container">
          {initailEvents && (
            <FullCalendar
              ref={calendarRef}
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
              initialEvents={initailEvents} // alternatively, use the `events` setting to fetch from a feed
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              // select={handleDateSelect}
              eventContent={renderEventContent} // custom render function
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              // aspectRatio={1.3} // cell의 크기 조절
              handleWindowResize={true}
              contentHeight={600}
              eventsSet={handleEvents} // called after events are initialized/added/changed/removed
            />
          )}
        </div>
        {initailEvents && (
          <RestaurantList
            callbackFn={(newEvent) => {
              if (calendarRef.current) {
                const orgCalenderEvent = calendarRef.current
                  .getApi()
                  .getEventById(newEvent.id);
                if (orgCalenderEvent) {
                  orgCalenderEvent.remove();
                }
                calendarRef.current?.getApi().addEvent({
                  id: newEvent.id,
                  title: newEvent.summary,
                  start: newEvent.start.date,
                  end: newEvent.end.date,
                  allDay: true,
                });
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
