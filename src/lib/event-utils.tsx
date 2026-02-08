// import { EventInput } from '@fullcalendar/core';
import { getHistory } from '@lib/api/calendar_api';

let eventGuid = 0;

async function setInitializeEvents(startDateStr: string, endDateStr: string) {
  const response = await getHistory(startDateStr, endDateStr);

  console.log('getHistory response:', response);

  let histories: Array<any> = response.items || [];

  console.log('histories', histories);

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
