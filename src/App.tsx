import MainPage from '@pages/MainPage';
import { useEffect, createContext, useReducer } from 'react';
import { getCurHistory } from '@api/calendar_api';
import { HistoryType, JSONResponse, StringKeyObj } from '@src/types';
import qs from 'qs';

const queryStr = qs.stringify({
  client_id: process.env.REACT_APP_GOOGLECALENDAR_CLIENT_ID,
  redirect_uri: 'http://localhost:3000',
  response_type: 'token',
  scope: 'https://www.googleapis.com/auth/calendar',
});
const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryStr}`;

export const UseDispatch = createContext<Function>(() => {});

const App = () => {
  const { access_token } = qs.parse(window.location.hash.substring(1));

  if (!access_token) {
    window.location.href = loginUrl;
  }

  const initialState = {
    histories: {},
    todayRestaurant: {},
  };
  const reducer = (prevState: Object, action: StringKeyObj) => {
    switch (action.type) {
      case 'setHistory': {
        const result = {
          ...prevState,
          histories: { ...action.payload },
        };
        console.log('check the action', action, result);
        return result;
      }

      case 'selectRestaurant': {
        const result = {
          ...prevState,
          todayRestaurant: { ...action.payload },
        };

        return result;
      }

      default:
        return prevState;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

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

      const nameAndDate = items.reduce(
        (result: HistoryType, item: JSONResponse): HistoryType => {
          const key = item.summary; // 일정 이름(식당 이름)
          const value = item.start.date; // 일정 이름(식당 이름)
          result[key] = value;
          return result;
        },
        {},
      );
      console.log(items, nameAndDate);
      // setHistories(nameAndDate);
      dispatch({ type: 'setHistory', payload: nameAndDate });
    };
    try {
      callCalendarAPI();
    } catch (e) {
      alert(e);
    }
  }, [access_token]);

  return (
    <UseDispatch.Provider value={dispatch}>
      <header></header>
      <MainPage state={state} />
      <footer></footer>
    </UseDispatch.Provider>
  );
};

export default App;
