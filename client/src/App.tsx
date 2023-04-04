import MainPage from '@pages/MainPage';
import { useEffect } from 'react';
import { getAuth } from '@api/calendar_api';
import qs from 'qs';

const queryStr = qs.stringify({
  client_id: process.env.REACT_APP_GOOGLECALENDAR_CLIENT_ID,
  redirect_uri: 'http://localhost:3000',
  response_type: 'token',
  scope: 'https://www.googleapis.com/auth/calendar',
});
const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryStr}`;

const App = () => {
  const { access_token } = qs.parse(window.location.hash.substring(1));

  if (!access_token) {
    window.location.href = loginUrl;
    // return null;
  }

  useEffect(() => {
    // fetch(CALENDAR_URI, {
    //   headers: {
    //     Authorization: "Bearer " + access_token
    //   }
    // }).then(response => response.json()).then(data => console.log(data.items));
    console.log(access_token);
  }, [access_token]);

  return (
    <>
      <header></header>
      <MainPage />
      <footer></footer>
    </>
  );
};

export default App;
