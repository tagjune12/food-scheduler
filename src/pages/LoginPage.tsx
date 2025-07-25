import { useEffect } from 'react';
import qs from 'qs';
import './LoginPage.scss';

const LoginPage = () => {
  const queryStr = qs.stringify({
    client_id: process.env.REACT_APP_GOOGLECALENDAR_CLIENT_ID,
    redirect_uri: 'http://localhost:3000',
    response_type: 'token',
    scope:
      'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email',
  });
  const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryStr}`;

  const handleLogin = () => {
    window.location.href = loginUrl;
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>Food Scheduler</h1>
          <p>음식 스케줄러에 오신 것을 환영합니다!</p>
          <p>Google 계정으로 로그인하여 캘린더 기능을 사용해보세요.</p>

          <button className="login-button" onClick={handleLogin}>
            <div className="google-icon">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>
            Google로 로그인
          </button>

          <div className="login-info">
            <p>로그인하면 다음 기능을 사용할 수 있습니다:</p>
            <ul>
              <li>구글 캘린더 연동</li>
              <li>음식 스케줄 관리</li>
              <li>식당 북마크</li>
              <li>위치 기반 식당 검색</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
