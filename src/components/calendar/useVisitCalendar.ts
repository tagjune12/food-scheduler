import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  DatesSetArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core';
import { deleteVisit, getVisits, moveVisit } from '@lib/api/visit_api';
import { toLocalDateString, visitToEvent } from '@lib/util';
import type { VisitWithPlace } from '@src/types';

export default function useVisitCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const latestRequestIdRef = useRef<number>(0);

  // 캘린더를 닫은 뒤 늦게 도착한 조회 결과(실패 alert 포함)를 무시하도록 진행 중인 요청을 무효화한다
  useEffect(() => {
    return () => {
      latestRequestIdRef.current += 1;
    };
  }, []);

  const handleDatesSet = useCallback(async (dateInfo: DatesSetArg) => {
    const requestId = ++latestRequestIdRef.current;
    const visits = await getVisits(
      toLocalDateString(dateInfo.start),
      toLocalDateString(dateInfo.end),
    );

    // 달을 빠르게 넘길 때 늦게 도착한 이전 범위의 응답이 현재 화면을 덮어쓰지 않게 한다
    if (requestId !== latestRequestIdRef.current) {
      return;
    }
    if (visits === null) {
      alert('일정을 불러오지 못했습니다.');
      return;
    }
    setEvents(visits.map(visitToEvent));
  }, []);

  const handleEventClick = useCallback(async (clickInfo: EventClickArg) => {
    const { event } = clickInfo;
    if (!window.confirm(`일정을 삭제하시겠습니까? '${event.title}'`)) {
      return;
    }

    const isDeleted = await deleteVisit(event.id);
    if (!isDeleted) {
      alert('일정 삭제에 실패했습니다.');
      return;
    }
    setEvents((prevEvents) => prevEvents.filter((prev) => prev.id !== event.id));
  }, []);

  const handleEventDrop = useCallback(async (dropInfo: EventDropArg) => {
    const { event } = dropInfo;
    if (!event.start || !window.confirm('일정을 변경하시겠습니까?')) {
      dropInfo.revert();
      return;
    }

    const newDate = toLocalDateString(event.start);
    const isMoved = await moveVisit(event.id, newDate);
    if (!isMoved) {
      dropInfo.revert();
      alert('일정 변경에 실패했습니다.');
      return;
    }
    setEvents((prevEvents) =>
      prevEvents.map((prev) =>
        prev.id === event.id ? { ...prev, start: newDate } : prev,
      ),
    );
    alert('일정을 변경하였습니다.');
  }, []);

  const onVisitAdded = useCallback((visit: VisitWithPlace) => {
    setEvents((prevEvents) => [...prevEvents, visitToEvent(visit)]);
  }, []);

  return {
    events,
    handleDatesSet,
    handleEventClick,
    handleEventDrop,
    onVisitAdded,
  };
}
