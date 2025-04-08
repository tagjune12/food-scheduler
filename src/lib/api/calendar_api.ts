import axios from 'axios';
import qs from 'qs';
import { access_token } from '@src/App';
import { getNumTypeToday, getStringDate, isTokenValid } from '@lib/util';

const CALENDAR_ID = 'ltjktnet12@gmail.com';
const BASE_URL = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`;

// 인증 헤더 생성 함수 - 토큰 유효성 검사 포함
const getAuthHeaders = () => {
  if (!access_token || !isTokenValid()) {
    throw new Error('유효한 인증 토큰이 없습니다.');
  }
  
  return {
    Authorization: 'Bearer ' + access_token,
  };
};

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
      headers: getAuthHeaders(),
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
  if (endDate > lastDate) {
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
  
  return axios
    .post(targetUri, body, {
      headers: getAuthHeaders(),
    })
    .then((response) => {
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
  console.log('LastDate: ', lastDate);
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
  
  return axios.put(targetUri, body, {
    headers: getAuthHeaders(),
  });
}

function deleteEvent(eventId: string) {
  const targetUri = `${BASE_URL}/${eventId}`;
  
  return axios.delete(targetUri, {
    headers: getAuthHeaders(),
  });
}

export { getHistory, insertEvent, updateEvent, deleteEvent };
