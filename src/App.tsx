import MainPage from '@pages/MainPage';
import { useEffect, createContext, useReducer } from 'react';
import { getHistory } from '@src/lib/api/calendar_api';
import { HistoryType, JSONResponse, StringKeyObj } from '@src/types';
import qs from 'qs';
import { getNumTypeToday } from '@lib/util';
import PrimarySearchAppBar from '@components/Searchbar';

const queryStr = qs.stringify({
  client_id: process.env.REACT_APP_GOOGLECALENDAR_CLIENT_ID,
  redirect_uri: 'http://localhost:3000',
  response_type: 'token',
  scope: 'https://www.googleapis.com/auth/calendar',
  // access_type: 'offline',
});
const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryStr}`;

export const UseDispatch = createContext<Function>(() => {});
export const access_token = qs.parse(
  window.location.hash.substring(1),
).access_token;

if (!access_token) {
  window.location.href = loginUrl;
}

const App = () => {
  const initialState = {
    histories: {},
    todayRestaurant: {},
    access_token: null,
    modal: {
      isVisible: false,
      target: null,
    },
  };
  const reducer = (prevState: Object, action: StringKeyObj) => {
    switch (action.type) {
      case 'setHistory': {
        const result = {
          ...prevState,
          histories: { ...action.payload },
        };

        return result;
      }

      case 'selectRestaurant': {
        const result = {
          ...prevState,
          todayRestaurant: { ...action.payload },
        };

        return result;
      }

      case 'setAccessToken': {
        const result = {
          ...prevState,
          access_token: action.payload,
        };

        return result;
      }

      case 'showModal': {
        const result = {
          ...prevState,
          modal: {
            isVisible: true,
            target: { ...action.payload },
          },
        };

        return result;
      }

      case 'hideModal': {
        const result = {
          ...prevState,
          modal: {
            isVisible: false,
            target: null,
          },
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
      const response = await getHistory(timeMin, timeMax);
      // console.log('FETCH', response);
      const items: Array<Object> = response.items;

      const today = getNumTypeToday();
      let todayRestaurant: { [key: string]: string } = {};

      const nameAndDate = items.reduce(
        (result: HistoryType, item: JSONResponse): HistoryType => {
          const key = item.summary; // 일정 이름(식당 이름)
          const value = { date: item.start.date, eventId: item.id }; // 일정 날짜, 이벤트ID

          if (
            today.year.toString().padStart(2, '0') ===
              item.start.date.split('-')[0] &&
            today.month.toString().padStart(2, '0') ===
              item.start.date.split('-')[1] &&
            today.date.toString().padStart(2, '0') ===
              item.start.date.split('-')[2]
          ) {
            todayRestaurant.name = key;
          }
          result[key] = value;
          return result;
        },
        {},
      );
      // console.log('nameAndDate', nameAndDate);
      dispatch({ type: 'setHistory', payload: nameAndDate });
      if (todayRestaurant) {
        dispatch({ type: 'selectRestaurant', payload: todayRestaurant });
      }
    };
    try {
      callCalendarAPI();
    } catch (e) {
      alert(e);
    }
  }, [access_token]);

  return (
    <UseDispatch.Provider value={dispatch}>
      {/*<header></header>*/}
      {/* <PrimarySearchAppBar /> */}
      <MainPage state={state} />
      <footer></footer>
    </UseDispatch.Provider>
  );
};

export default App;
