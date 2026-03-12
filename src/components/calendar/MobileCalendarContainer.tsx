import React, { useEffect, useRef, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import {
  EventApi,
  EventClickArg,
  EventDropArg,
  DatesSetArg,
  EventInput,
} from '@fullcalendar/core';
import {
  deleteEvent,
  getCalendarList,
  updateEvent,
} from '@lib/api/calendar_api';
import { setInitializeEvents } from '@lib/event-utils';
import { getUserCalendar } from '@lib/api/supabase_api';
import {
  useTodayRestaurantDispatch,
  useTodayRestaurantState,
} from '@src/context/TodayRestaurantContext';
import MobileCalendar from './MobileCalendar';
import { getStoredUserId } from '@lib/util';

export default function MobileCalendarContainer({
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

  const handleDatesSet = (dateInfo: DatesSetArg) => {
    setViewRange({
      start: dateInfo.start,
      end: dateInfo.end,
    });
  };

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

  const onRestaurantListCallback = (newEvent: any) => {
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
  };

  useEffect(() => {
    const userId = getStoredUserId() || '';

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
    <MobileCalendar
      calendarRef={calendarRef}
      initailEvents={initailEvents}
      handleDatesSet={handleDatesSet}
      closeCalendar={closeCalendar}
      fetchGoogleCalendar={fetchGoogleCalendar}
      handleEventClick={handleEventClick}
      handleEventDrop={handleEventDrop}
      handleEvents={handleEvents}
      onRestaurantListCallback={onRestaurantListCallback}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      setCurrentCalendarId={setCurrentCalendarId}
      calendarList={calendarList}
    />
  );
}
