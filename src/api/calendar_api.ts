import axios from 'axios';
import qs from 'qs';
import { access_token } from '@src/App';

const CALENDAR_ID = 'ltjktnet12@gmail.com';
const BASE_URL = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`;

function getCurHistory(startTime: string, endTime: string): Promise<any> {
  const query = qs.stringify({
    timeMin: startTime,
    timeMax: endTime,
  });
  const targetUri = `${BASE_URL}?${query}`;

  return axios(targetUri, {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
  }).then((response) => response.data);
}

function insertEvent(name: string, visitDate: Date) {
  const targetUri = `${BASE_URL}`;
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
  axios
    .post(targetUri, body, config)
    .then((response) => console.log(response.data));
}

export { getCurHistory, insertEvent };
