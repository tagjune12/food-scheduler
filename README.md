## 🍽️ 머먹지

맛집 방문 기록을 관리하고 다음 방문을 계획하는 웹 애플리케이션입니다. Kakao 지도에서 맛집을 탐색하고, 방문 일정과 북마크를 Supabase에 저장해 캘린더에서 관리합니다.

### 주요 기능

- **지도 탐색 (Kakao Maps JS SDK)**
  - 식당 마커 표시, 마커 클러스터링, 커스텀 오버레이(카드) 표시
  - 장소 필터: 전체 / 음식점 / 카페 전환 버튼
  - 클러스터 클릭 시 해당 구역 식당 목록 모달 표시
- **검색 (툴바)**
  - 식당명 키워드 자동완성 검색 (Supabase 기반)
  - `#태그 키워드` 형식의 태그 기반 검색, 여러 태그 동시 적용 지원
  - 검색 결과 선택 시 지도 이동 및 상세 오버레이 표시
- **방문 일정 관리 (Supabase + FullCalendar)**
  - 지도·목록에서 고른 식당을 오늘 방문 일정으로 추가 (하루 여러 곳 가능)
  - 드래그앤드롭으로 날짜 이동, 클릭으로 삭제
  - 데스크탑·모바일 반응형 캘린더 UI
- **북마크 관리 (Supabase)**
  - 식당 북마크 추가/삭제, 사이드바에서 즐겨찾기 목록 확인
- **인증 (Supabase Auth + Google 로그인)**
  - 비로그인 상태에서도 지도 탐색 가능
  - 로그인 시 방문 일정·북마크 기능 활성화
  - 사용자 데이터는 RLS로 본인만 접근
- **반응형 UI**
  - MUI 기반 툴바, 모바일용 캘린더/사이드바 레이아웃

### 기술 스택

- **Frontend**: React 18, TypeScript, Vite 6, MUI v6, SCSS
- **지도**: Kakao Maps JavaScript SDK
- **캘린더**: FullCalendar v6 (daygrid, interaction 플러그인)
- **인증**: Supabase Auth (Google provider, PKCE)
- **데이터베이스**: Supabase (PostgreSQL, RLS) + supabase-js
- **테스트**: Vitest
- **라우팅**: React Router v6
- **상태관리**: React Context API (Auth / Bookmark / Modal / MapInit)

### 요구사항

- Node.js 18+ (Volta 고정: `18.19.1`)
- npm

### 환경 변수 설정 (.env)

`REACT_APP_` 접두사가 있는 변수만 클라이언트로 주입됩니다(`vite.config.ts`의 `envPrefix` 설정). 프로젝트 루트에 `.env` 파일을 만들고 아래 값을 설정하세요.

```bash
# Kakao Maps
REACT_APP_KAKAO_MAP_API_JS_KEY=your_kakao_javascript_key
REACT_APP_KAKAO_MAP_API_REST_KEY=your_kakao_rest_api_key

# Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

참고:

- Kakao Developers에서 JavaScript 앱 키를 발급받고 도메인 허용 목록에 `http://localhost:3000`을 추가하세요.
- Google 로그인 설정은 아래 "Supabase 설정"에서 합니다. 앱에는 Google 관련 환경 변수가 필요 없습니다.

### Supabase 설정

1. **마이그레이션 적용**: `supabase/migrations/`의 SQL을 파일명 순서대로 적용합니다 (SQL Editor 또는 `npx supabase login` → `npx supabase link --project-ref <project-ref>` → `npx supabase db push`). SQL Editor로 적용한 경우, 나중에 CLI로 전환하기 전에 `npx supabase migration repair --status applied 20261006000001 20261006000002 20261011000003 20261011000004 20261011000005`로 적용 이력을 맞춰야 `db push`가 같은 SQL을 다시 실행하지 않습니다.
2. **Google Cloud Console**: OAuth 클라이언트의 승인된 리디렉션 URI에 `https://<project-ref>.supabase.co/auth/v1/callback`을 추가합니다.
3. **Supabase 대시보드 → Authentication → Providers → Google**: 활성화하고 클라이언트 ID와 시크릿을 입력합니다.
4. **Supabase 대시보드 → Authentication → URL Configuration**: Site URL과 Redirect URLs에 `http://localhost:3000`과 운영 도메인을 등록합니다.
5. **타입 재생성**: 스키마를 바꾼 뒤에는 `npx supabase gen types typescript --project-id <project-ref> > src/types/supabase.ts`를 실행합니다. (사전에 `npx supabase login` 필요) 생성 파일이므로 직접 수정하지 않습니다. PowerShell 5에서는 `>`가 UTF-16으로 저장하므로 Git Bash 등에서 실행하세요.

### 설치 및 실행

```bash
# 의존성 설치. @types/node(^18.19.1)가 vite 6의 peer 범위 안이라 --legacy-peer-deps는 필요 없다.
# 이 플래그로 설치하면 peer 의존성(moment 등)이 package-lock.json에서 빠지므로 쓰지 않는다
npm install

# 개발 서버 실행 (http://localhost:3000)
npm start

# 단위 테스트 (vite.config.ts의 test.env로 Asia/Seoul 시간대에서 실행)
npm test

# 프로덕션 빌드
npm run build

# 프로덕션 번들 로컬 확인
npm run preview
```

### 라우팅/인증 흐름

- 경로
  - `/login`: Google 로그인 버튼 페이지
  - `/`: 메인 페이지 (비로그인 상태에서도 지도 탐색 가능)
  - `/privacy`: 개인정보처리방침
- 인증
  - 로그인 버튼이 `supabase.auth.signInWithOAuth`로 Google 로그인을 시작합니다(PKCE). 앱으로 돌아오면 supabase-js가 세션을 만들고 localStorage에 보관·갱신합니다.
  - 로그인 상태는 `AuthContext`로 전역 관리합니다: `session`, `userId`(비로그인이면 빈 문자열), `isLogin`, `isAuthLoading`(저장된 세션 확인 중), `signInWithGoogle`, `signOut`.
  - 로그인이 실패해 `?error=...`(또는 `#error=...`)로 돌아오면 알림을 띄우고 URL에서 오류 파라미터를 지웁니다.
  - 캘린더 버튼을 누르거나 일정을 저장할 때 미로그인이면 로그인 페이지로 안내합니다.

### 데이터 모델

| 객체 | 용도 |
|---|---|
| `visits` | 방문 일정 (`user_id`, `place_id` → `places.id`, `visit_date`) |
| `user_bookmarks` | 북마크 (`user_id`, `place_id`) |
| `get_places_with_my_bookmarks()` | 지도용 식당 목록 + 내 북마크 여부 |
| `get_places_by_names_with_my_bookmarks(p_place_names)` | 클러스터 목록용 식당 + 내 북마크 여부 |

사용자 데이터는 RLS로 `auth.uid()`가 일치하는 행만 접근할 수 있습니다. 이전 Google Calendar 방식에서 쓰던 `history`, `calendar`, `bookmarks` 테이블과 관련 뷰·함수는 삭제했습니다.

### 아키텍처

주요 컴포넌트는 **Container / Presentational 패턴**으로 분리되어 있습니다.

| Container | Presentational | 역할 |
|---|---|---|
| `MapContainer` | `Map` | 지도 초기화, 마커/클러스터/오버레이 로직 |
| `MainToolbarContainer` | `MainToolbar` | 검색·태그 처리, 로그인/로그아웃 상태 |
| `CalendarContainer` | `Calendar` | 방문 일정 조회·이동·삭제 (`useVisitCalendar` 공용 훅) |
| `MobileCalendarContainer` | `MobileCalendar` | 모바일 캘린더 UI (같은 훅 사용) |
| `RestaurantListContainer` | `RestaurantList` | 캘린더 옆 식당 목록 |

### 디렉터리 구조

```
src/
├── components/         # 공통 컴포넌트
│   ├── Map/            # Kakao 지도, 마커/클러스터/오버레이, 장소 필터
│   ├── calendar/       # FullCalendar UI, 방문 일정 훅, 모바일 캘린더
│   ├── sidebar/        # 사이드바 레이아웃, 즐겨찾기 목록
│   └── commons/
│       └── maintoolbar/  # 검색창, 태그 검색, 로그인/로그아웃 버튼
├── context/            # Auth / Bookmark / Modal / MapInit 전역 상태
├── lib/
│   └── api/            # Supabase / 방문 일정 / Kakao API
├── pages/              # LoginPage, MainPage, PrivacyPage
└── types/              # Supabase, Kakao, 공통 타입 정의
supabase/
└── migrations/         # DB 스키마 변경 SQL
```

### 문제 해결

- **Kakao 지도 미표시**: JS 키(`REACT_APP_KAKAO_MAP_API_JS_KEY`) 확인, 도메인 허용 목록에 `http://localhost:3000` 추가
- **Google 로그인 후 오류 또는 로그인이 유지되지 않음**: Supabase Redirect URLs에 현재 origin이 등록됐는지, Google OAuth 클라이언트에 Supabase 콜백 URL이 등록됐는지 확인
- **일정·북마크 저장 실패 (401/403/42501)**: 로그인 상태와 마이그레이션 적용 여부(RLS 정책·권한) 확인
- **Supabase 401/네트워크 에러**: 프로젝트 URL/Anon Key 및 CORS 설정 확인

### 라이선스

MIT
