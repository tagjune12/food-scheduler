import MainPage from '@pages/MainPage';
import { useEffect, createContext, useReducer, useState, useRef } from 'react';
import { getHistory } from '@src/lib/api/calendar_api';
import { HistoryType, JSONResponse, StringKeyObj } from '@src/types';
import qs from 'qs';
import {
  getNumTypeToday,
  saveToken,
  getStoredToken,
  isTokenValid,
  saveUserId,
  getStoredUserId,
  removeStoredUserId,
} from '@lib/util';
import PrimarySearchAppBar from '@components/sidebar/Searchbar';
import './App.scss';
import {
  TodayRestaurantProvider,
  useTodayRestaurantDispatch,
} from './context/TodayRestaurantContext';
import { ModalProvider } from './context/ModalContext';
import { useMapInitDispatch } from './context/MapInitContext';
import { getUserInfo, GoogleUserInfo } from '@lib/api/user_api';
import { BookmarkProvider } from './context/BookMarkContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';

const queryStr = qs.stringify({
  client_id: process.env.REACT_APP_GOOGLECALENDAR_CLIENT_ID,
  redirect_uri: 'http://localhost:3000',
  response_type: 'token',
  scope:
    'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email',
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

const AuthenticatedApp = () => {
  const initialState = {
    histories: {},
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

      default:
        return prevState;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // 지도 초기화 상태
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);
  const mapInitDispatch = useMapInitDispatch();
  const TodayRestaurantDispatch = useTodayRestaurantDispatch();

  const userId = useRef<string | null>(null);

  // 사용자 ID 초기화 함수
  const initializeUserId = async () => {
    // 먼저 localStorage에서 저장된 userId 확인
    const storedUserId = getStoredUserId();
    if (storedUserId) {
      userId.current = storedUserId;
      console.log('저장된 사용자 ID 사용:', storedUserId);
      return;
    }

    // localStorage에 없으면 Google API에서 가져오기
    try {
      const userInfo = await getUserInfo();
      console.log('사용자 정보:', userInfo);
      const newUserId = userInfo.email?.split('@')[0];
      if (newUserId) {
        userId.current = newUserId;
        saveUserId(newUserId); // localStorage에 저장
        console.log('새로운 사용자 ID 저장:', newUserId);
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
    }
  };

  // 토큰 상태 설정 및 인터벌 설정
  useEffect(() => {
    if (!access_token) return;

    // 유효한 토큰이 있으면 상태 저장
    mapInitDispatch({ type: 'setAccessToken', payload: access_token });

    // 사용자 ID 초기화
    initializeUserId();

    setIsLoading(false);

    // 토큰 만료 체크 인터벌 설정
    const tokenCheckInterval = setInterval(() => {
      if (!isTokenValid()) {
        console.log('토큰이 만료되어 재로그인이 필요합니다.');
        // 저장된 사용자 ID도 삭제
        removeStoredUserId();
        // 토큰 만료 시 로그인 페이지로 이동
        window.location.href = '/login';
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
        dispatch({ type: 'setHistory', payload: nameAndDate });
        if (todayRestaurant) {
          TodayRestaurantDispatch({
            type: 'selectRestaurant',
            payload: todayRestaurant,
          });
        }
      } catch (error: any) {
        console.error('API 호출 오류:', error);

        // 인증 오류 (401) 발생 시 토큰 갱신
        if (error.response && error.response.status === 401) {
          console.log('인증 오류가 발생하여 다시 로그인합니다.');
          removeStoredUserId();
          window.location.href = '/login';
        } else {
          alert('일정을 불러오는 중 오류가 발생했습니다.');
        }
      }
    };

    callCalendarAPI();
  }, [access_token, isLoading]);

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <UseDispatch.Provider value={dispatch}>
      <BookmarkProvider userId={userId.current ?? ''}>
        <TodayRestaurantProvider>
          <ModalProvider>
            <MainPage state={state} />
          </ModalProvider>
        </TodayRestaurantProvider>
      </BookmarkProvider>
    </UseDispatch.Provider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            access_token && isTokenValid() ? (
              <AuthenticatedApp />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
