// import { EventInput } from '@fullcalendar/core';
import { getHistory } from '@lib/api/calendar_api';

let eventGuid = 0;

async function setInitializeEvents(
  startDateStr: string,
  endDateStr: string,
  calendarId: string,
) {
  const response = await getHistory(
    startDateStr,
    endDateStr,
    calendarId === '' ? 'primary' : calendarId,
  );
  let histories: Array<any> = response.items || [];

  return histories.map((calendarEvent: any) => ({
    id: calendarEvent.id,
    title: calendarEvent.summary,
    start: calendarEvent.start.date,
  }));
}

function createEventId() {
  return String(eventGuid++);
}

export { setInitializeEvents, createEventId };
