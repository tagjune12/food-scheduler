import qs from 'qs';
import { access_token } from '@src/App';
import { getNumTypeToday, isTokenValid } from '@lib/util';

const DEFAULT_CALENDAR_ID = 'primary';
const getBaseUrl = (calendarId: string) =>
  `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

// 인증 헤더 생성 함수 - 토큰 유효성 검사 포함
const getAuthHeaders = () => {
  if (!access_token || !isTokenValid()) {
    throw new Error('유효한 인증 토큰이 없습니다.');
  }

  return {
    Authorization: 'Bearer ' + access_token,
    'Content-Type': 'application/json',
  };
};

/**
 * statTiem, endTime 입력 안되어있으면 오늘,다음날로 입력됨
 * @param startTime 시작날(ISO string)
 * @param endTime 끝나는날(포함X)(ISO string)
 * @param calendarId 캘린더 ID (기본값: 'primary')
 * @returns
 */
async function getHistory(
  startTime?: string,
  endTime?: string,
  calendarId: string = DEFAULT_CALENDAR_ID,
): Promise<any> {
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
  const targetUri = `${getBaseUrl(calendarId)}?${query}`;

  try {
    const response = await fetch(targetUri, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

async function insertEvent(
  name: string,
  visitDate: Date,
  calendarId: string = DEFAULT_CALENDAR_ID,
) {
  const targetUri = `${getBaseUrl(calendarId)}`;
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

  try {
    const response = await fetch(targetUri, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

async function updateEvent(
  name: string,
  eventId: string,
  visitDate: Date,
  calendarId: string = DEFAULT_CALENDAR_ID,
) {
  const targetUri = `${getBaseUrl(calendarId)}/${eventId}`;
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

  try {
    const response = await fetch(targetUri, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

async function deleteEvent(
  eventId: string,
  calendarId: string = DEFAULT_CALENDAR_ID,
) {
  const targetUri = `${getBaseUrl(calendarId)}/${eventId}`;

  try {
    const response = await fetch(targetUri, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

async function getCalendarList() {
  const targetUri = `https://www.googleapis.com/calendar/v3/users/me/calendarList`;
  try {
    const response = await fetch(targetUri, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export { getHistory, insertEvent, updateEvent, deleteEvent, getCalendarList };
