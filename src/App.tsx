import MainPage from '@pages/MainPage';
import { useEffect, useState, createContext } from 'react';
import { getCurHistory } from '@api/calendar_api';
import { HistoryType, JSONResponse } from 'types';
import qs from 'qs';

const queryStr = qs.stringify({
  client_id: process.env.REACT_APP_GOOGLECALENDAR_CLIENT_ID,
  redirect_uri: 'http://localhost:3000',
  response_type: 'token',
  scope: 'https://www.googleapis.com/auth/calendar',
});
const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryStr}`;

export const HistoryContext = createContext<HistoryType>({});

const App = () => {
  const { access_token } = qs.parse(window.location.hash.substring(1));

  if (!access_token) {
    window.location.href = loginUrl;
    // return null;
  } /* else {
    window.location.href = 'http://localhost:3000';
  }
  */
  const [histories, setHistories] = useState<HistoryType>({});

  useEffect(() => {
    const today = new Date();
    const timeMax = today.toISOString();
    const timeMin = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate(),
    ).toISOString();

    const callCalendarAPI = async () => {
      const response = await getCurHistory(
        access_token as string,
        timeMin,
        timeMax,
      );
      // console.log('FETCH', response);
      const items: Array<Object> = response.items;
      console.log(items);
      const nameAndDate = items.reduce(
        (result: HistoryType, item: JSONResponse): HistoryType => {
          const key = item.summary; // 일정 이름(식당 이름)
          const value = item.start.date; // 일정 이름(식당 이름)
          result[key] = value;
          return result;
        },
        {},
      );
      setHistories(nameAndDate);
    };
    try {
      callCalendarAPI();
    } catch (e) {
      alert(e);
    }
  }, [access_token]);

  return (
    <HistoryContext.Provider value={histories}>
      <header></header>
      <MainPage />
      <footer></footer>
    </HistoryContext.Provider>
  );
};

export default App;
