## 🍽️ Food Scheduler

맛집 방문 기록을 관리하고 다음 방문을 계획하는 웹 애플리케이션입니다. Kakao 지도에서 맛집을 탐색하고, Google Calendar와 연동하여 방문 일정을 관리하며, Supabase에 북마크/방문 이력을 저장합니다.

### 주요 기능

- **지도 탐색 (Kakao Maps JS SDK)**
  - 식당 마커 표시, 마커 클러스터링, 커스텀 오버레이(카드) 표시
  - 검색 결과 선택 시 해당 위치로 이동 및 상세 오버레이 표시
- **방문 일정 관리 (Google Calendar API)**
  - 오늘 일정 자동 인식, 일정 조회/추가/수정/삭제
- **북마크/이력 관리 (Supabase)**
  - 식당 북마크 추가/삭제, 사용자별 북마크/방문 이력 조회
- **UI**
  - 사이드바(검색/오늘의 식당/북마크/이력), 캘린더 뷰, MUI 기반 툴바/스켈레톤 로딩

### 기술 스택

- **Frontend**: React 18, TypeScript, CRA + CRACO, MUI, SCSS
- **지도**: Kakao Maps JavaScript SDK + MarkerClusterer
- **캘린더/인증**: Google OAuth 2.0 (Implicit Flow), Google Calendar API
- **데이터베이스**: Supabase(PostgreSQL) + supabase-js
- **상태관리**: React Context API

### 요구사항

- Node.js LTS (권장: 18+)
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

- Google OAuth 동의화면/클라이언트ID를 생성하고 `Authorized redirect URIs`에 `REACT_APP_GOOGLE_LOGIN_REDIRECT_URL`을 등록하세요.
- 리디렉션 URL을 `/login`으로 설정하면 로그인 후에도 로그인 페이지에 머무를 수 있습니다. 이 앱은 루트(`/`)로 리디렉션하도록 구성하는 것을 권장합니다.

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
  - `/`: 인증 성공 시 메인 페이지 (미인증 시 `/login`으로 이동)
- 인증
  - Google OAuth 2.0 Implicit Flow로 발급된 `access_token`을 해시에서 파싱하여 저장합니다.
  - 토큰 유효성 주기적 검사 후 만료 시 `/login`으로 이동합니다.
- 캘린더
  - Google Calendar에서 일정 조회/추가/수정/삭제를 수행합니다. 일정 `summary`를 식당명으로 사용합니다.

### 디렉터리 구조 (발췌)

```
src/
├── components/
│   ├── Map.tsx                 # Kakao 지도, 마커/클러스터/오버레이
│   ├── calendar/               # 캘린더 UI
│   ├── sidebar/                # 사이드바(검색/오늘의 식당/북마크/이력)
│   └── commons/                # 공통 UI (모달/툴바/카드 등)
├── context/                    # Modal/MapInit/BookMark/TodayRestaurant 컨텍스트
├── lib/
│   └── api/
│       ├── calendar_api.ts     # Google Calendar 연동
│       ├── supabase_api.ts     # Supabase 연동 (places/history/bookmarks 및 RPC)
│       └── kakao_api.ts        # Kakao Local REST API 검색
├── pages/
│   ├── LoginPage.tsx           # Google 로그인
│   └── MainPage.tsx            # 메인 화면(지도/사이드바/캘린더)
└── types/                      # 타입 정의 (supabase 등)
```

### 동작 요약

- **지도 초기화**: Kakao JS SDK를 동적 로딩 후 지도/클러스터를 초기화합니다.
- **장소 데이터**: Supabase `places`에서 조회하고, 사용자별 북마크 여부를 RPC/뷰로 함께 조회합니다.
- **오버레이 카드**: 식당 상세, 방문일, 북마크 추가/삭제 버튼 제공
- **검색**: Kakao Local REST API로 검색, 선택 시 지도 이동 + 상세 오버레이 표시
- **캘린더 동기화**: 요일/날짜 기준으로 오늘 방문 식당을 자동 선택하고, 일정 CRUD API 제공

### Supabase 참고 (테이블/뷰/RPC)

프로젝트는 다음 엔티티/뷰/RPC를 사용합니다(환경에 맞게 생성되어 있어야 합니다).

- 테이블: `places`, `history`, `bookmarks`
- 뷰/테이블: `call_places_with_history`, `call_bookmarks_with_places`
- 함수(RPC): `get_places_with_bookmarks`, `get_places_with_name_and_bookmarks`

### 문제 해결

- Kakao 지도 미표시: JS 키(`REACT_APP_KAKAO_MAP_API_JS_KEY`) 확인, 도메인 허용 목록에 `http://localhost:3000` 추가
- Google 로그인 루프: 리디렉션 URL을 `/`로 설정했는지 확인
- Supabase 401/네트워크 에러: 프로젝트 URL/Anon Key 및 CORS 설정 확인

### 라이선스

MIT
