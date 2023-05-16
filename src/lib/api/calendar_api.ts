import axios from 'axios';
import qs from 'qs';
import { access_token } from '@src/App';
import { getNumTypeToday, getStringDate } from '@lib/util';

const CALENDAR_ID = 'ltjktnet12@gmail.com';
const BASE_URL = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`;
/**
 * statTiem, endTime 입력 안되어있으면 오늘,다음날로 입력됨
 * @param startTime 시작날(ISO string)
 * @param endTime 끝나는날(포함X)(ISO string)
 * @returns
 */
function getHistory(startTime?: string, endTime?: string): Promise<any> {
  const numTypeToday = getNumTypeToday();
  const query = qs.stringify({
    timeMin: startTime ?? new Date().toISOString(),
    timeMax:
      endTime ??
      new Date(
        numTypeToday.year,
        numTypeToday.month,
        numTypeToday.date + 1,
      ).toISOString(),
  });
  const targetUri = `${BASE_URL}?${query}`;

  return axios
    .get(targetUri, {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
    .then((response) => response.data);
}

async function insertEvent(name: string, visitDate: Date) {
  const targetUri = `${BASE_URL}`;
  const [startYear, startMonth, startDate]: number[] = [
    visitDate.getFullYear(),
    visitDate.getMonth() + 1,
    visitDate.getDate(),
  ];
  const lastDate = new Date(startYear, startMonth, 0).getDate();
  let [endYear, endMonth, endDate]: number[] = [
    startYear,
    startMonth,
    startDate + 1,
  ];
  if (endDate === lastDate) {
    endDate = 1;
    endMonth++;
  }
  if (endMonth > 12) {
    endMonth = 1;
    endYear++;
  }

  const body = {
    summary: name,
    start: {
      date: `${startYear}-${startMonth.toString().padStart(2, '0')}-${startDate
        .toString()
        .padStart(2, '0')}`,
    },
    end: {
      date: `${endYear}-${endMonth.toString().padStart(2, '0')}-${endDate
        .toString()
        .padStart(2, '0')}`,
    },
  };
  const config = {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
  };
  return axios.post(targetUri, body, config).then((response) => {
    console.log(response.data);
    return response.data;
  });
}

async function updateEvent(name: string, eventId: string, visitDate: Date) {
  const targetUri = `${BASE_URL}/${eventId}`;
  const [startYear, startMonth, startDate] = [
    visitDate.getFullYear(),
    visitDate.getMonth() + 1,
    visitDate.getDate(),
  ];
  const lastDate = new Date(startYear, startMonth, 0).getDate();
  let [endYear, endMonth, endDate] = [startYear, startMonth, startDate + 1];
  if (endDate === lastDate) {
    endDate = 1;
    endMonth++;
  }
  if (endMonth > 12) {
    endMonth = 1;
    endYear++;
  }

  const body = {
    summary: name,
    start: {
      date: `${startYear}-${startMonth.toString().padStart(2, '0')}-${startDate
        .toString()
        .padStart(2, '0')}`,
    },
    end: {
      date: `${endYear}-${endMonth.toString().padStart(2, '0')}-${endDate
        .toString()
        .padStart(2, '0')}`,
    },
  };
  const config = {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
  };
  axios.put(targetUri, body, config);
}

function deleteEvent(eventId: string) {
  const targetUri = `${BASE_URL}/${eventId}`;
  const config = {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
  };

  return axios.delete(targetUri, config);
}

export { getHistory, insertEvent, updateEvent, deleteEvent };
