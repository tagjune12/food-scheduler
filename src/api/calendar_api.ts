import axios from 'axios';

function getCurHistory(
  access_token: string,
  startTime: string,
  endTime: string,
): Promise<any> {
  const CALENDAR_ID = 'ltjktnet12@gmail.com';
  const CALENDAR_URI = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?timeMin=${startTime}&timeMax=${endTime}`;

  return axios(CALENDAR_URI, {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
  }).then((response) => response.data);
}

export { getCurHistory };
