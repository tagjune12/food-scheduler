## 🍽️ 머먹지

맛집 방문 기록을 관리하고 다음 방문을 계획하는 웹 애플리케이션입니다. Kakao 지도에서 맛집을 탐색하고, Google Calendar와 연동하여 방문 일정을 관리하며, Supabase에 북마크/방문 이력을 저장합니다.

### 주요 기능

- **지도 탐색 (Kakao Maps JS SDK)**
  - 식당 마커 표시, 마커 클러스터링, 커스텀 오버레이(카드) 표시
  - 장소 필터: 전체 / 음식점 / 카페 전환 버튼
  - 클러스터 클릭 시 해당 구역 식당 목록 모달 표시
- **검색 (툴바)**
  - 식당명 키워드 자동완성 검색 (Supabase 기반)
  - `#태그 키워드` 형식의 태그 기반 검색, 여러 태그 동시 적용 지원
  - 검색 결과 선택 시 지도 이동 및 상세 오버레이 표시
- **방문 일정 관리 (Google Calendar API + FullCalendar)**
  - Google Calendar 일정 가져오기/추가/수정(드래그앤드롭)/삭제
  - 데스크탑·모바일 반응형 캘린더 UI
- **북마크 관리 (Supabase)**
  - 식당 북마크 추가/삭제, 사이드바에서 즐겨찾기 목록 확인
- **인증 (Google OAuth 2.0)**
  - 비로그인 상태에서도 지도 탐색 가능
  - 로그인 시 캘린더 연동 및 북마크 기능 활성화
- **반응형 UI**
  - MUI 기반 툴바, 모바일용 캘린더/사이드바 레이아웃

### 기술 스택

- **Frontend**: React 18, TypeScript, CRA + CRACO, MUI v6, SCSS
- **지도**: Kakao Maps JavaScript SDK
- **캘린더**: FullCalendar v6 (daygrid, interaction 플러그인)
- **인증/캘린더 API**: Google OAuth 2.0 (Implicit Flow), Google Calendar API
- **데이터베이스**: Supabase (PostgreSQL) + supabase-js
- **라우팅**: React Router v6
- **상태관리**: React Context API (Auth / Bookmark / Modal / MapInit)

### 요구사항

- Node.js 18+ (Volta 고정: `18.19.1`)
- npm

### 환경 변수 설정 (.env)

CRA는 `REACT_APP_` 접두사가 있는 변수만 클라이언트로 주입됩니다. 프로젝트 루트에 `.env` 파일을 만들고 아래 값을 설정하세요.

```bash
# Google OAuth / Calendar
REACT_APP_GOOGLECALENDAR_CLIENT_ID=your_google_oauth_client_id
# 로그인 성공 후 리디렉션될 URL (권장: 애플리케이션 루트 경로)
REACT_APP_GOOGLE_LOGIN_REDIRECT_URL=http://localhost:3000/

# Kakao Maps
REACT_APP_KAKAO_MAP_API_JS_KEY=your_kakao_javascript_key
REACT_APP_KAKAO_MAP_API_REST_KEY=your_kakao_rest_api_key

# Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

참고:

- Google OAuth 동의화면/클라이언트 ID를 생성하고 `Authorized redirect URIs`에 `REACT_APP_GOOGLE_LOGIN_REDIRECT_URL`을 등록하세요.
- Google Calendar API의 scope: `calendar.events`, `userinfo.email`, `calendar.calendarlist.readonly`
- Kakao Developers에서 JavaScript 앱 키를 발급받고 도메인 허용 목록에 `http://localhost:3000`을 추가하세요.

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 테스트
npm test

# 프로덕션 빌드
npm run build
```

### 라우팅/인증 흐름

- 경로
  - `/login`: Google 로그인 버튼 페이지
  - `/`: 메인 페이지 (비로그인 상태에서도 지도 탐색 가능)
- 인증
  - Google OAuth 2.0 Implicit Flow로 발급된 `access_token`을 URL 해시에서 파싱하여 localStorage에 저장합니다.
  - 로그인 상태는 `AuthContext`(`isLogin`)로 전역 관리합니다.
  - 캘린더 버튼 클릭 시 미로그인이면 로그인 페이지로 안내합니다.

### 아키텍처

주요 컴포넌트는 **Container / Presentational 패턴**으로 분리되어 있습니다.

| Container | Presentational | 역할 |
|---|---|---|
| `MapContainer` | `Map` | 지도 초기화, 마커/클러스터/오버레이 로직 |
| `MainToolbarContainer` | `MainToolbar` | 검색·태그 처리, 로그인/로그아웃 상태 |
| `CalendarContainer` | `Calendar` | Google Calendar CRUD, FullCalendar 연결 |
| `MobileCalendarContainer` | `MobileCalendar` | 모바일 캘린더 UI |
| `RestaurantListContainer` | `RestaurantList` | 캘린더 옆 식당 목록 |

### 디렉터리 구조

```
src/
├── components/         # 공통 컴포넌트
│   ├── Map/            # Kakao 지도, 마커/클러스터/오버레이, 장소 필터
│   ├── calendar/       # FullCalendar UI, Google Calendar 연동, 모바일 캘린더
│   ├── sidebar/        # 사이드바 레이아웃, 즐겨찾기 목록
│   └── commons/
│       └── maintoolbar/  # 검색창, 태그 검색, 로그인/로그아웃 버튼
├── context/            # Auth / Bookmark / Modal / MapInit 전역 상태
├── lib/
│   └── api/            # Google Calendar / Supabase / Kakao / User API
├── pages/              # LoginPage, MainPage
└── types/              # Supabase, Kakao, 공통 타입 정의
```

### 문제 해결

- **Kakao 지도 미표시**: JS 키(`REACT_APP_KAKAO_MAP_API_JS_KEY`) 확인, 도메인 허용 목록에 `http://localhost:3000` 추가
- **Google 로그인 후 캘린더 불가**: 리디렉션 URL을 `/`로 설정했는지 확인, OAuth 동의화면에서 Calendar API scope 허용 여부 확인
- **Supabase 401/네트워크 에러**: 프로젝트 URL/Anon Key 및 RLS/CORS 설정 확인

### 라이선스

MIT