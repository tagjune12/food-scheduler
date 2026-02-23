import { useEffect, useRef, useState, useCallback } from 'react';
import {
  EventApi,
  EventClickArg,
  EventContentArg,
  EventDropArg,
} from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { setInitializeEvents } from '@lib/event-utils';
import { EventInput } from '@fullcalendar/core';
import {
  deleteEvent,
  getCalendarList,
  updateEvent,
} from '@lib/api/calendar_api';
import '@components/calendar/Calendar.scss';
// import { UseDispatch } from '@src/App';
import RestaurantList from '@components/calendar/RestaurantList';
import CalendarListModal from './CalendarListModal';
import {
  useTodayRestaurantDispatch,
  useTodayRestaurantState,
} from '@src/context/TodayRestaurantContext';
import { DatesSetArg } from '@fullcalendar/core'; // 상단 import 추가
import { getUserCalendar } from '@lib/api/supabase_api';

export default function Calendar({
  closeCalendar,
}: {
  closeCalendar: () => void;
}) {
  const [initailEvents, setInitEvents] = useState<EventInput[]>();
  const todayRestaurantDispatch = useTodayRestaurantDispatch();
  const { todayRestaurant } = useTodayRestaurantState();
  const calendarRef = useRef<FullCalendar>(null);
  const [viewRange, setViewRange] = useState<{ start: Date; end: Date } | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [calendarList, setCalendarList] = useState<any>(null);
  const [currentCalendarId, setCurrentCalendarId] = useState<string>('');

  // 일정 클릭하면 삭제할건지 뜸
  const handleEventClick = (clickInfo: EventClickArg) => {
    if (window.confirm(`일정을 삭제하시겠습니까? '${clickInfo.event.title}'`)) {
      try {
        const eventId = clickInfo.event._def.publicId;
        deleteEvent(eventId);
        clickInfo.event.remove();
        todayRestaurantDispatch({ type: 'deleteEvent' });
      } catch (e) {}
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
    // setCurrentEvents(events);
  };

  // 2. 달력의 뷰(날짜 범위)가 변경될 때마다 호출되는 콜백
  const handleDatesSet = (dateInfo: DatesSetArg) => {
    // dateInfo.start: 화면에 보이는 달력의 시작 날짜 (이전 달의 날짜 포함 가능)
    // dateInfo.end: 화면에 보이는 달력의 끝 날짜
    // dateInfo.view.currentStart: 현재 달력의 기준 월 (예: 2월 1일)

    setViewRange({
      start: dateInfo.start,
      end: dateInfo.end,
    });
  };

  // 캘린더 초기화
  const initEvents = useCallback(
    async (startDatestr: string, endDatestr: string, calendarId: string) => {
      setInitEvents(
        await setInitializeEvents(startDatestr, endDatestr, calendarId),
      );
      calendarRef.current?.getApi().refetchEvents();
    },
    [initailEvents],
  );

  const fetchGoogleCalendar = async () => {
    try {
      const list = await getCalendarList();
      setCalendarList(list);
      setIsModalOpen(true);
    } catch (e) {
      console.error(e);
      alert('캘린더 목록을 가져오는데 실패했습니다.');
    }
  };

  // 3. viewRange가 변경되거나 todayRestaurant가 변경될 때 실행되는 useEffect
  useEffect(() => {
    const userId = localStorage.getItem('userId') || '';

    if (!currentCalendarId) {
      getUserCalendar(userId).then((userCalendar) => {
        if (userCalendar && userCalendar.length > 0) {
          setCurrentCalendarId(userCalendar[0].calendar_id);
        } else {
          setCurrentCalendarId('primary');
        }
      });
      return;
    }

    // viewRange가 없으면 현재 월로 이벤트 가져옴(첫 렌더링 직전)
    if (!viewRange) {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 31);
      initEvents(
        startDate.toISOString(),
        endDate.toISOString(),
        currentCalendarId,
      );

      return;
    }
    initEvents(
      viewRange.start.toISOString(),
      viewRange.end.toISOString(),
      currentCalendarId,
    );
  }, [viewRange, todayRestaurant, currentCalendarId]);

  return (
    <>
      <div className="calendar-wrapper">
        <div className="calendar-and-list-container">
          <div className="calendar-container">
            {true && (
              <FullCalendar
                ref={calendarRef}
                datesSet={handleDatesSet}
                customButtons={{
                  closeButton: {
                    text: 'X',
                    click: () => {
                      closeCalendar();
                    },
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
                events={initailEvents} // alternatively, use the `events` setting to fetch from a feed
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
          {true && (
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
      <CalendarListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(id) => setCurrentCalendarId(id)}
        calendarList={calendarList}
      />
    </>
  );
}
