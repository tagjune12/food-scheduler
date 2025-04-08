import MainPage from '@pages/MainPage';
import { useEffect, createContext, useReducer, useState } from 'react';
import { getHistory } from '@src/lib/api/calendar_api';
import { HistoryType, JSONResponse, StringKeyObj } from '@src/types';
import qs from 'qs';
import {
  getNumTypeToday,
  saveToken,
  getStoredToken,
  isTokenValid,
} from '@lib/util';
import PrimarySearchAppBar from '@components/Searchbar';
import './App.scss';

const queryStr = qs.stringify({
  client_id: process.env.REACT_APP_GOOGLECALENDAR_CLIENT_ID,
  redirect_uri: 'http://localhost:3000',
  response_type: 'token',
  scope: 'https://www.googleapis.com/auth/calendar',
  // access_type: 'offline',
});
const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryStr}`;

export const UseDispatch = createContext<Function>(() => {});
// 지도 초기화 상태를 위한 Context 생성
export const MapInitContext = createContext<{ initialized: boolean }>({
  initialized: false,
});

// 해시에서 토큰 파싱
const hashParams = qs.parse(window.location.hash.substring(1));
export let access_token: string | null = null;

// 토큰 초기화 함수
const initializeToken = () => {
  // 해시에 토큰이 있으면 저장
  if (hashParams.access_token) {
    const token = hashParams.access_token as string;
    const expiresIn = parseInt((hashParams.expires_in as string) || '3600');
    saveToken(token, expiresIn);

    // URL에서 해시 제거
    window.history.replaceState({}, document.title, window.location.pathname);

    access_token = token;
    return token;
  }

  // 로컬스토리지에 저장된 유효한 토큰 확인
  const storedToken = getStoredToken();
  if (storedToken) {
    access_token = storedToken;
    return storedToken;
  }

  // 토큰이 없거나 만료됐으면 null 반환
  return null;
};

// 앱 시작시 토큰 초기화
initializeToken();

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // 지도 초기화 상태
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);

  // 토큰 상태 확인 및 리다이렉트
  useEffect(() => {
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!access_token) {
      window.location.href = loginUrl;
      return;
    }

    // 유효한 토큰이 있으면 상태 저장
    dispatch({ type: 'setAccessToken', payload: access_token });
    setIsLoading(false);

    // 토큰 만료 체크 인터벌 설정
    const tokenCheckInterval = setInterval(() => {
      if (!isTokenValid()) {
        console.log('토큰이 만료되어 재로그인이 필요합니다.');
        // 토큰 만료 시 로그인 페이지로 이동
        window.location.href = loginUrl;
        clearInterval(tokenCheckInterval);
      }
    }, 60000); // 1분마다 체크

    return () => clearInterval(tokenCheckInterval);
  }, []);

  useEffect(() => {
    if (!access_token || isLoading) return;

    const today = new Date();
    const timeMax = today.toISOString();
    const timeMin = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate(),
    ).toISOString();

    const callCalendarAPI = async () => {
      try {
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
      } catch (error: any) {
        console.error('API 호출 오류:', error);

        // 인증 오류 (401) 발생 시 토큰 갱신
        if (error.response && error.response.status === 401) {
          console.log('인증 오류가 발생하여 다시 로그인합니다.');
          window.location.href = loginUrl;
        } else {
          alert('일정을 불러오는 중 오류가 발생했습니다.');
        }
      }
    };

    callCalendarAPI();
  }, [access_token, isLoading]);

  // 데이터 로드 완료 후 지도 초기화 상태 활성화
  useEffect(() => {
    if (!isLoading && !mapInitialized) {
      // 약간의 지연 후 지도 초기화 상태 활성화 (경쟁 상태 방지)
      const timer = setTimeout(() => {
        setMapInitialized(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, mapInitialized]);

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <UseDispatch.Provider value={dispatch}>
      <MapInitContext.Provider value={{ initialized: mapInitialized }}>
        {/*<header></header>*/}
        {/* <PrimarySearchAppBar /> */}
        <MainPage state={state} />
        <footer></footer>
      </MapInitContext.Provider>
    </UseDispatch.Provider>
  );
};

export default App;
