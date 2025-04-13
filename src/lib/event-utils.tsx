// import { EventInput } from '@fullcalendar/core';
import { getHistory } from '@lib/api/calendar_api';

let eventGuid = 0;
let todayStr = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today
const curYear = new Date().getFullYear();

// export const INITIAL_EVENTS: EventInput[] = [
//   {
//     id: createEventId(),
//     title: 'All-day event',
//     start: todayStr,
//   },
//   {
//     id: createEventId(),
//     title: 'Timed event',
//     start: todayStr + 'T12:00:00',
//   },
// ];

// let INITIAL_EVENTS: EventInput[];
async function setInitializeEvents() {
  let histories: Array<any> = (
    await getHistory(
      new Date(curYear, 1, 1).toISOString(),
      new Date(curYear, 12, 31).toISOString(),
    )
  ).items;

  return histories.map((calendarEvent) => ({
    id: calendarEvent.id,
    title: calendarEvent.summary,
    start: calendarEvent.start.date,
  }));
}

function createEventId() {
  return String(eventGuid++);
}

export { setInitializeEvents, createEventId };
