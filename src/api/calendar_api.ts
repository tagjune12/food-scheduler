import qs from 'qs';
import axios from 'axios';

const CLIENT_ID = process.env.REACT_APP_GOOGLECALENDAR_CLIENT_ID;
const CALENDAR_ID = `ltjktnet12@gmail.com`;
const MAX_TIME = `2023-03-01T00:00:00Z`;
const MIN_TIME = `2023-03-31T00:00:00Z`;

async function getAuth() {
  const queryStr = qs.stringify({
    client_id: CLIENT_ID,
    redirect_uri: 'http://localhost:3000',
    response_type: 'token',
    scope: 'https://www.googleapis.com/auth/calendar',
  });
  const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryStr}`;

  try {
    const response = await axios.get(loginUrl);
    console.log(response);
  } catch (e) {
    alert(e);
    console.log(e);
  }
}

export { getAuth };
