# 방문 일정 저장소 전환 (Google Calendar → Supabase) 설계

작성일: 2026-10-06
대상 브랜치: `claude/restaurant-schedule-supabase-53cedd`

## 1. 배경

방문 일정은 현재 사용자의 Google Calendar에 종일 이벤트(`summary` = 식당 이름)로 저장된다. 로그인은 Google OAuth Implicit Flow로 받은 `access_token`을 localStorage에 두고, 이메일 앞부분을 `user_id`로 삼아 Supabase(anon key)에 북마크를 저장한다.

이 구조의 문제는 다음과 같다.

- 일정 데이터가 앱 바깥(Google Calendar)에 있어 식당(`places`)과 연결되지 않는다. 식당은 이름 문자열로만 이어진다.
- Supabase에는 Supabase Auth 세션 없이 클라이언트가 넘기는 `user_id`로 접근한다. anon key는 번들에 공개되므로 누구나 다른 사용자의 `user_id`로 데이터를 읽고 쓸 수 있다.
- `BookmarkProvider`가 `userId`를 `useReducer` 초기값으로만 받고, `App.tsx`는 ref 값을 넘긴다. 그래서 로그인 후에도 `state.userId`가 빈 문자열로 고정된다.

이 작업의 목적은 **방문 일정을 Supabase에 저장하고, Supabase Auth(Google)와 RLS로 사용자별 데이터를 보호**하는 것이다.

## 2. 확정된 결정

| 항목 | 결정 | 근거 |
|---|---|---|
| Google Calendar | 완전 제거 | 일정 저장소를 Supabase 하나로 둔다. 동기화는 하지 않는다 |
| 기존 Google 일정 | 이관하지 않음 | 새로 시작한다 |
| 인증 | Supabase Auth (Google provider, PKCE) | RLS로 `auth.uid()` 기반 접근 제어를 하기 위함 |
| 기존 북마크·history 데이터 | 버리고 새로 시작 | 이메일 앞부분 `user_id`를 auth UUID로 매핑하지 않는다 |
| 기존 DB 객체 | **삭제하지 않음** | 사용자 지시 전까지 테이블·뷰·함수를 DROP하지 않는다. 새 객체를 새 이름으로 나란히 만든다 (§8) |
| 하루 일정 개수 | 제한 없음 | 유니크 제약을 두지 않는다. 저장은 항상 추가다 |
| 일정 추가 날짜 | 항상 오늘 | 다른 날짜로는 드래그로 옮긴다 (현재 동작 유지) |
| 데이터 접근 방식 | 클라이언트 supabase-js 직접 CRUD + RLS | RPC 래핑이나 Edge Function은 강제할 규칙이 없어 과하다 |
| 식당 참조 | `place_id` → `places.id` 외래키 | 이름 문자열 대신 ID로 연결한다 |
| 날짜 표현 | `date` 컬럼 + 로컬 `YYYY-MM-DD` 문자열 | `toISOString()`의 KST 하루 밀림을 피한다 |
| 마이그레이션 적용 | SQL 파일을 `supabase/migrations/`에 두고 사용자가 적용 | 원격 DB 접근 권한은 사용자에게 있다 |

## 3. 비목표

- 기존 DB 객체 삭제 (§8 목록만 남긴다)
- 날짜를 골라 일정을 추가하는 기능
- 점심/저녁 구분
- `places` 테이블의 RLS 변경 (수집 스크립트 등이 anon key로 쓰고 있을 수 있다)
- 화면에 렌더링되지 않는 `TodayRestaurant`, `History` 컴포넌트 정리 (컴파일이 깨지지 않도록 호출 시그니처만 맞춘다)
- `MapInitContext`의 `access_token` 필드와 `setAccessToken` 액션 (주석 처리된 코드에서만 dispatch하며 런타임 영향이 없다)
- 이 저장소 밖의 개인정보처리방침 페이지(`tagjune12.github.io/privacy_url`) 수정. 사용자가 직접 한다

## 4. 설계

### 4.1 DB 마이그레이션

#### 전제 조건 (구현 첫 단계에서 SQL Editor로 확인)

```sql
-- places.id가 PK인지, 각 컬럼 타입이 무엇인지
select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'places';

select conname, contype from pg_constraint where conrelid = 'public.places'::regclass;

-- places의 RLS 상태와 정책 (로그인 후에는 authenticated 역할로 조회하게 되므로)
select relrowsecurity from pg_class where oid = 'public.places'::regclass;
select policyname, roles, cmd from pg_policies where schemaname = 'public' and tablename = 'places';

-- 기존 RPC 본문 (같은 필터 조건을 새 함수에 유지하기 위함)
select pg_get_functiondef('public.get_places_with_bookmarks'::regproc);
select pg_get_functiondef('public.get_places_with_name_and_bookmarks'::regproc);
```

- `places.id`가 PK(또는 유니크)가 아니면 외래키를 걸 수 없다.
- `places` 행을 대량으로 삭제하고 다시 넣는 운영 방식이 있으면 외래키가 삭제를 막는다.
- 둘 중 하나라도 해당되면 외래키를 빼고 `place_name`을 함께 저장하는 방식으로 바꾼다. 이 경우 설계를 다시 확인받는다.
- 기존 RPC에 이름·북마크 조인 외의 필터(예: `category_group_code`)가 있으면 새 RPC에도 똑같이 유지한다.
- `places`의 RLS가 켜져 있는데 `authenticated`(또는 `public`)가 SELECT할 수 있는 정책이 없으면, 로그인한 사용자에게 지도가 비어 보인다. 이 경우 `places` 정책 추가가 필요하므로 진행 전에 사용자에게 확인받는다 (§3에서 `places` RLS 변경을 범위 밖으로 두었기 때문).

#### 공통 원칙

- RLS 정책의 사용자 비교는 `(select auth.uid())` 형태로 쓴다. 행마다 함수를 다시 평가하지 않게 하기 위함이다.
- 새 테이블은 Supabase 기본 권한을 믿지 않는다. `revoke all` 후 필요한 권한만 명시적으로 부여한다.
- 함수는 `security invoker`, `set search_path = ''`로 만들고 모든 객체를 스키마까지 붙여 쓴다.

#### ① `supabase/migrations/20261006000001_user_bookmarks.sql`

```sql
-- 이메일 앞부분 user_id를 쓰던 bookmarks를 대체한다. 기존 bookmarks와 관련 뷰·함수는 건드리지 않는다.
create table public.user_bookmarks (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  place_id   text        not null references public.places (id),
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

alter table public.user_bookmarks enable row level security;

revoke all on public.user_bookmarks from anon, authenticated;
-- anon에게 select를 주는 이유: 비로그인 상태에서 아래 RPC가 이 테이블을 left join한다.
-- anon용 정책이 없으므로 anon이 실제로 보는 행은 0개다.
grant select on public.user_bookmarks to anon;
grant select, insert, delete on public.user_bookmarks to authenticated;

create policy user_bookmarks_select_own on public.user_bookmarks
  for select to authenticated using (user_id = (select auth.uid()));
create policy user_bookmarks_insert_own on public.user_bookmarks
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy user_bookmarks_delete_own on public.user_bookmarks
  for delete to authenticated using (user_id = (select auth.uid()));

-- 기존 get_places_with_bookmarks(p_user_id)를 대체한다. 비로그인이면 전부 'N'.
create function public.get_places_with_my_bookmarks()
returns table (
  id                  public.places.id%type,
  place_name          public.places.place_name%type,
  category_group_code public.places.category_group_code%type,
  category_group_name public.places.category_group_name%type,
  category_name       public.places.category_name%type,
  address_name        public.places.address_name%type,
  road_address_name   public.places.road_address_name%type,
  phone               public.places.phone%type,
  place_url           public.places.place_url%type,
  latitude            public.places.latitude%type,
  longitude           public.places.longitude%type,
  created_at          public.places.created_at%type,
  updated_at          public.places.updated_at%type,
  bookmarked          text
)
language sql stable security invoker
set search_path = ''
as $$
  select p.id, p.place_name, p.category_group_code, p.category_group_name, p.category_name,
         p.address_name, p.road_address_name, p.phone, p.place_url, p.latitude, p.longitude,
         p.created_at, p.updated_at,
         case when b.place_id is null then 'N' else 'Y' end
  from public.places p
  left join public.user_bookmarks b
    on b.place_id = p.id and b.user_id = (select auth.uid())
$$;

-- 기존 get_places_with_name_and_bookmarks(p_place_names, p_user_id)를 대체한다.
create function public.get_places_by_names_with_my_bookmarks(p_place_names text[])
returns table (
  id                  public.places.id%type,
  place_name          public.places.place_name%type,
  category_group_code public.places.category_group_code%type,
  category_group_name public.places.category_group_name%type,
  category_name       public.places.category_name%type,
  address_name        public.places.address_name%type,
  road_address_name   public.places.road_address_name%type,
  phone               public.places.phone%type,
  place_url           public.places.place_url%type,
  latitude            public.places.latitude%type,
  longitude           public.places.longitude%type,
  created_at          public.places.created_at%type,
  updated_at          public.places.updated_at%type,
  bookmarked          text
)
language sql stable security invoker
set search_path = ''
as $$
  select p.id, p.place_name, p.category_group_code, p.category_group_name, p.category_name,
         p.address_name, p.road_address_name, p.phone, p.place_url, p.latitude, p.longitude,
         p.created_at, p.updated_at,
         case when b.place_id is null then 'N' else 'Y' end
  from public.places p
  left join public.user_bookmarks b
    on b.place_id = p.id and b.user_id = (select auth.uid())
  where p.place_name = any (p_place_names)
$$;
```

새 RPC 이름을 기존과 다르게 짓는 이유가 있다. 같은 이름으로 오버로드하면 PostgREST가 어느 함수를 호출할지 모호해질 수 있다.

#### ② `supabase/migrations/20261006000002_visits.sql`

```sql
create table public.visits (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  place_id   text        not null references public.places (id),
  visit_date date        not null,
  created_at timestamptz not null default now()
);

create index visits_user_date_idx on public.visits (user_id, visit_date);

alter table public.visits enable row level security;

revoke all on public.visits from anon, authenticated;
grant select, insert, delete on public.visits to authenticated;
-- 수정은 날짜 이동만 허용한다
grant update (visit_date) on public.visits to authenticated;

create policy visits_select_own on public.visits
  for select to authenticated using (user_id = (select auth.uid()));
create policy visits_insert_own on public.visits
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy visits_update_own on public.visits
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy visits_delete_own on public.visits
  for delete to authenticated using (user_id = (select auth.uid()));
```

### 4.2 인증

#### Supabase 클라이언트 (`src/lib/api/supabase_api.ts`)

```ts
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { flowType: 'pkce' },
});
```

`detectSessionInUrl`, `persistSession`, `autoRefreshToken`은 기본값(true)을 쓴다. OAuth에서 돌아올 때 URL의 `code`를 supabase-js가 세션으로 교환하고 localStorage에 저장한다.

#### `AuthContext` 재작성 (`src/context/AuthContext.tsx`)

```ts
interface AuthContextType {
  session: Session | null;
  userId: string;          // 로그아웃 상태면 ''
  isLogin: boolean;
  isAuthLoading: boolean;  // 첫 getSession() 완료 전 true
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

- 마운트될 때 `onAuthStateChange`를 구독하고, 언마운트 때 해제한다. 구독 직후 오는 `INITIAL_SESSION` 이벤트에 저장된 세션(또는 OAuth code 교환 결과)이 담겨 오므로, 이 첫 이벤트에서 `isAuthLoading`을 false로 바꾼다. `getSession()`을 따로 호출하지 않아 두 경로 사이의 경합이 없다.
- `signInWithGoogle`은 `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`를 호출한다.
- `setIsLogin`은 없앤다. 로그인 상태는 세션에서만 나온다.

#### Provider 배치 (`src/App.tsx`)

```
<BrowserRouter>
  <AuthProvider>
    <Routes>
      /        → <BookmarkProvider><ModalProvider><MainPage/></ModalProvider></BookmarkProvider>
      /login   → <LoginPage/>
      /privacy → <PrivacyPage/>
```

- 다음을 제거한다: URL 해시 파싱, `access_token` export, `initializeToken`, `initializeUserId`, `getUserInfo` 호출, `TodayRestaurantProvider`, `calendar_api`의 `getHistory` import.
- `UseDispatch`와 `histories` 리듀서는 이번 작업과 관계없으므로 그대로 둔다.

#### 로그인 상태 사용처

| 위치 | 현재 | 변경 |
|---|---|---|
| `LoginPage` 버튼 | Google OAuth URL로 이동 | `signInWithGoogle()` |
| `MainPage` 캘린더 버튼, 인트로 모달 조건 | `getStoredToken() === null` | `!isLogin` (인트로 모달은 `!isAuthLoading && !isLogin`) |
| `MainToolbarContainer.handleLogout` | localStorage 키 삭제 + `setIsLogin(false)` | `signOut()` |
| `Bookmark`, `SideBar` | `useAuth().isLogin` | 그대로 (`Bookmark`의 미사용 `setIsLogin` 구조분해와 `SideBar`의 미사용 `getStoredToken`·`useTodayRestaurantState` import만 제거) |

### 4.3 북마크 전환

- `BookmarkProvider`는 `userId` prop을 없애고 `useAuth().userId`를 직접 읽는다. 상태의 `userId`도 리듀서 초기값이 아니라 매 렌더의 auth 값으로 제공한다. `MapContainer`가 `userId` 변화를 마커 재로딩 트리거로 쓰므로 `useBookMarkState().userId`는 계속 노출한다.
- `supabase_api.ts`의 북마크 함수들은 `userId` 파라미터를 없앤다. 사용자 필터는 RLS가 처리한다.
  - `insertBookmark(placeId)`: `user_bookmarks.upsert({ place_id }, { onConflict: 'user_id,place_id', ignoreDuplicates: true })`
  - `deleteBookmark(placeId)`: `user_bookmarks.delete().eq('place_id', placeId)`
  - `getBookmarks()`: `user_bookmarks.select('place_id, places(*)').order('created_at')`의 결과를 기존 `BookmarkItem` 형태(`id` = place id)로 펼친다. 소비 측 코드는 바뀌지 않는다.
  - `getPlacesWithUserBookmarks(categoryFilter?)`는 `get_places_with_my_bookmarks`를 호출한다.
  - `getPlacesWithNameAndBookmarks(names, categoryFilter?)`는 `get_places_by_names_with_my_bookmarks`를 호출한다.
- 호출부(`MapContainer`, `History`)는 `userId` 인자만 뺀다.

### 4.4 방문 일정

#### `src/lib/api/visit_api.ts` (신규)

`VisitWithPlace`는 `src/types/index.d.ts`에 생성 타입에서 파생해 둔다.

```ts
type VisitRow = Database['public']['Tables']['visits']['Row'];
type VisitWithPlace = Pick<VisitRow, 'id' | 'visit_date' | 'place_id'> & {
  places: Pick<PlaceRow, 'place_name'> | null;
};
```

```ts
const VISIT_SELECT = 'id, visit_date, place_id, places(place_name)';

getVisits(startDate: string, endDate: string): Promise<VisitWithPlace[] | null>  // start 이상, end 미만
addVisit(placeId: string, visitDate: string): Promise<VisitWithPlace | null>
moveVisit(visitId: string, visitDate: string): Promise<boolean>
deleteVisit(visitId: string): Promise<boolean>
```

`docs/CODE_CONVENTIONS.md` §10에 따라 모든 함수는 `try/catch`로 감싸고, 실패하면 `console.error`로 로그를 남긴다. 그 뒤 실패를 뜻하는 값(`null` / `false`)을 반환한다. 기존 `supabase_api.ts`는 실패해도 `[]`를 반환한다. 이 파일은 "결과 없음"(`[]`)과 "실패"(`null`)를 구분한다. UI가 실패를 알아야 되돌리기와 알림을 처리할 수 있기 때문이다.

#### 순수 함수 (`src/lib/util.ts`에 추가)

```ts
toLocalDateString(date: Date): string        // 로컬 기준 'YYYY-MM-DD' (기존 getStringDate 재사용)
visitToEvent(visit: VisitWithPlace): EventInput
// → { id: visit.id, title: visit.places?.place_name ?? '(알 수 없는 식당)', start: visit.visit_date, allDay: true }
```

`src/lib/event-utils.tsx`는 삭제한다. 이 파일은 `calendar_api.ts` → `App.tsx`를 import하므로, 테스트에서 불러오면 모듈 최상단의 `window` 접근과 SCSS import까지 딸려 온다. 그 안의 `setInitializeEvents`는 Google에 의존하고 `createEventId`는 쓰이지 않는다. `util.ts`는 타입 외의 import가 없어 테스트하기 쉽고, 이미 `getStringDate`가 있어서 그대로 재사용한다.

#### `src/components/calendar/useVisitCalendar.ts` (신규 공용 훅)

`CalendarContainer`와 `MobileCalendarContainer`의 중복 로직을 이 훅 하나로 합친다. 두 컨테이너는 훅의 반환값을 각자의 프레젠테이션 컴포넌트에 넘기기만 한다.

- **상태:** `events: EventInput[]`가 화면에 보이는 일정의 단일 출처다. 추가·이동·삭제는 FullCalendar 명령형 API가 아니라 이 상태를 갱신해 반영한다.
- **`handleDatesSet(info)`:** `getVisits(toLocalDateString(info.start), toLocalDateString(info.end))`로 다시 불러온다. FullCalendar가 첫 렌더에도 `datesSet`을 호출하므로 별도의 초기 범위 계산은 없앤다. 응답 순서가 뒤바뀔 때를 대비해 마지막 요청의 결과만 반영한다.
- **`handleEventClick(info)`:** 확인창 → `await deleteVisit(id)` → 성공하면 상태에서 제거한다. 실패하면 알림만 띄운다.
- **`handleEventDrop(info)`:** 확인창(취소 시 `info.revert()`) → `await moveVisit(id, toLocalDateString(info.event.start))` → 성공하면 상태의 해당 일정 날짜를 갱신한다. 실패하면 `info.revert()` 후 알림을 띄운다.
- **`onVisitAdded(visit)`:** 상태에 `visitToEvent(visit)`를 덧붙인다. 하루 제한이 없으므로 기존 일정을 교체하지 않는다.

#### 캘린더 프레젠테이션 (`Calendar.tsx`, `MobileCalendar.tsx`)

- 제거할 props: `fetchGoogleCalendar`, `isModalOpen`, `setIsModalOpen`, `setCurrentCalendarId`, `calendarList`, `handleEvents`(no-op)
- 데스크톱 헤더에서 `googleCalendarBtn`("📅 달력 가져오기")을 뺀다.
- 두 컴포넌트에서 `CalendarListModal` 렌더링을 뺀다.
- `onRestaurantListCallback`이 `onVisitAdded`를 받는다.

#### 저장 모달 (`src/components/commons/Modal.tsx`)

- 제목은 "오늘 방문 일정 추가", 본문은 "선택하신 식당을 오늘 방문 일정에 추가하시겠습니까?"로 바꾼다.
- 확인 버튼을 누르면 다음 순서로 처리한다.
  1. `!isLogin`이면 "로그인이 필요합니다. 로그인하시겠습니까?" 확인창을 띄우고, 확인하면 `/login`으로 이동한다. 저장하지 않는다.
  2. `restaurant.id`가 없으면 "식당 정보를 찾을 수 없습니다." 알림을 띄우고 끝낸다.
  3. `addVisit(restaurant.id, toLocalDateString(new Date()))` → `modalState.callbackFn?.(visit)` → 모달을 닫는다.
  4. 실패하면 "일정 추가에 실패했습니다." 알림을 띄운다. 모달은 열어 둔다.
- "오늘 일정이 있으면 수정" 분기, `getUserCalendar` 호출, `TodayRestaurantContext` 사용을 없앤다.

#### 식당 ID 전달 누락 수정

`MapContainer`는 지도 오버레이 버튼의 `data-restaurant` JSON을 그대로 모달에 넘긴다. 그런데 [MapCard.tsx](../../../src/components/commons/MapCard.tsx)와 [RestaurantCard.tsx](../../../src/components/commons/RestaurantCard.tsx)의 `data-restaurant`에는 `id`가 없다. 두 곳 모두 `id: restaurant.id`를 추가한다. 나머지 경로(`ListModal`, 캘린더 옆 목록, `MapCard`/`RestaurantCard`의 직접 클릭 핸들러)는 이미 `id`를 넘긴다.

### 4.5 제거되는 코드

| 대상 | 처리 |
|---|---|
| `src/lib/api/calendar_api.ts` | 파일 삭제 |
| `src/lib/event-utils.tsx` | 파일 삭제 (순수 함수는 `util.ts`로) |
| `src/lib/api/user_api.ts` | 파일 삭제 |
| `src/components/calendar/CalendarListModal.tsx`, `CalendarListModalContainer.tsx`, `CalendarListModal.scss` | 파일 삭제 |
| `src/context/TodayRestaurantContext.tsx` | 파일 삭제 (실제 역할이 캘린더 재조회 신호뿐이었다) |
| `supabase_api.ts`의 `getHistory`, `insertHistory`, 주석 처리된 `updateHistory`, `getUserCalendar`, `setUserCalendar` | 함수 삭제 (DB 객체는 유지) |
| `util.ts`의 `saveToken`, `isTokenValid`, `getStoredToken`, `saveUserId`, `getStoredUserId`, `removeStoredUserId`, `removeStoredToken` | 함수 삭제 |
| 환경변수 `REACT_APP_GOOGLECALENDAR_CLIENT_ID`, `REACT_APP_GOOGLE_LOGIN_REDIRECT_URL` | README에서 삭제 |

이 표의 삭제는 모두 앱 코드다. DB 객체는 하나도 삭제하지 않는다.

### 4.6 에러 처리

| 상황 | 처리 |
|---|---|
| 일정 조회 실패 | 콘솔 에러 + "일정을 불러오지 못했습니다." 알림. 기존 표시는 유지 |
| 일정 추가 실패 | 알림, 모달 유지 |
| 일정 이동 실패 | `revert()` + 알림 |
| 일정 삭제 실패 | 알림, 화면의 일정 유지 |
| 세션 없음/만료 상태에서 쓰기 | supabase-js가 토큰을 자동 갱신한다. 그래도 세션이 없으면 RLS·권한 오류가 나므로 위의 "실패" 처리로 수렴한다. UI 진입점(캘린더 버튼, 저장 모달)은 `isLogin`으로 먼저 막는다 |
| 북마크 함수 | 기존처럼 에러를 삼키고 빈 결과를 반환한다 (동작 변경 없음) |

### 4.7 문구·문서

- `README.md`: 소개, 주요 기능, 기술 스택, 환경변수, 라우팅/인증 흐름, 아키텍처 표, 문제 해결을 갱신한다. §5의 Supabase 설정 절차를 추가한다.
- `PrivacyPage.tsx`: 수집 항목(Google 계정 이메일, 방문 일정, 북마크)과 저장 위치(Supabase)를 반영해 다시 쓴다. "외부 서버에 저장하지 않는다"는 문구는 사실과 달라지므로 삭제한다.
- `LoginPage.tsx`: 소개 문구와 "로그인하면 사용할 수 있는 기능" 목록에서 Google Calendar 연동을 뺀다.
- `IntroModal.tsx`: "캘린더에 연동" 문구를 바꾼다.

## 5. 수동 설정 절차 (사용자 수행)

1. **마이그레이션 적용:** §4.1의 전제 조건을 확인한 뒤 두 SQL 파일을 순서대로 적용한다. SQL Editor에 붙여넣거나 `supabase db push`를 쓴다.
2. **Google Cloud Console:** 기존 OAuth 클라이언트의 승인된 리디렉션 URI에 `https://<project-ref>.supabase.co/auth/v1/callback`을 추가한다.
3. **Supabase 대시보드 → Authentication → Providers → Google:** 활성화하고 클라이언트 ID와 시크릿을 입력한다.
4. **Supabase 대시보드 → Authentication → URL Configuration:** Site URL과 Redirect URLs에 `http://localhost:3000`과 운영 도메인을 등록한다.
5. **타입 재생성:** `npx supabase gen types typescript --project-id <project-ref> > src/types/supabase.ts`를 실행한다. 이 파일은 생성 파일이므로 직접 수정하지 않는다 (`docs/CODE_CONVENTIONS.md` §5). CLI 로그인(`npx supabase login`)이 필요하다.
6. **`.env`:** Google 관련 두 변수를 지운다(남아 있어도 동작에는 영향 없음).

## 6. 테스트

### 6.1 자동 테스트

- 현재 테스트 러너가 없다. `vitest@^3`을 devDependency로 추가한다. Vite 6과 Node 18을 지원하는 버전이다. `package.json`에 `"test": "vitest run"`을 추가한다. 설치는 README 규칙대로 `--legacy-peer-deps`를 붙인다.
- TDD 대상은 `util.ts`의 순수 함수다. 테스트 파일은 `src/lib/util.test.ts`에 둔다.
  - `toLocalDateString`: 일반 날짜, 한 자리 월·일 0 채움, 로컬 자정 직후(00:30), 월말·연말 경계
  - `visitToEvent`: 필드 매핑, `places`가 null일 때의 제목
- `npm run build`(tsc 포함)가 통과해야 한다.

### 6.2 수동 확인 (마이그레이션 적용과 §5 설정 후 브라우저에서)

1. Google 로그인 → 새로고침 후에도 로그인이 유지된다.
2. 지도 카드, 클러스터 목록, 캘린더 옆 식당 목록 각각에서 일정을 추가하면 캘린더에 바로 나타난다.
3. 같은 날 여러 개를 추가할 수 있다.
4. 드래그로 이동한 날짜가 새로고침 후에도 유지된다. 이동을 취소하면 원위치된다.
5. 일정을 클릭해 삭제하면 새로고침 후에도 없다.
6. 북마크 추가·삭제가 사이드바와 지도 별 표시에 반영된다.
7. 로그아웃 상태에서 캘린더 버튼과 저장 모달이 로그인 안내를 띄운다. 지도 탐색은 그대로 된다.
8. RLS: 로그아웃 상태의 anon 클라이언트로 `visits`를 조회하면 권한 오류가 나거나 빈 결과가 나온다. 다른 Google 계정으로 로그인하면 첫 계정의 일정과 북마크가 보이지 않는다.

## 7. 구현 단계와 배포

1. **DB:** 전제 조건 확인 → 마이그레이션 ①② 작성 → 사용자 적용 → 타입 재생성
2. **방문 일정:** Vitest 도입과 `util.ts` 순수 함수 TDD → `visit_api` → `useVisitCalendar` → 두 캘린더 컨테이너·프레젠테이션 → `Modal` → `data-restaurant` id 추가 → Google Calendar 일정 코드 삭제
3. **인증:** `AuthContext`, `App`, `LoginPage`, 로그아웃, `BookmarkProvider`, 토큰 유틸·`user_api` 삭제
4. **북마크:** 북마크 API·RPC 호출을 새 객체로 전환
5. **문구·문서**

일정을 인증보다 먼저 하는 이유는 컴파일 순서 때문이다. `calendar_api.ts`는 `App.tsx`의 `access_token`과 `util.ts`의 토큰 함수를 import한다. 인증을 먼저 바꾸면 `calendar_api.ts`와 그 소비자들이 일정 작업 전까지 컴파일되지 않는다. 일정 쪽 코드는 기존 `AuthContext`의 `isLogin`만 쓰므로 인증 전환 전에도 컴파일된다. 런타임 확인은 인증까지 끝난 뒤 §6.2로 한 번에 한다.

배포 순서는 마이그레이션 적용 → §5의 2~4 설정 → 앱 배포다.

**롤백:** 기존 테이블·뷰·함수를 그대로 두므로 이전 버전 앱을 다시 배포하면 Google Calendar 방식으로 돌아간다. 새 객체(`visits`, `user_bookmarks`, 새 RPC 2개)는 남아 있어도 이전 앱에 영향이 없다.

**2026-10-11 변경:** 최종 리뷰에서 기존 객체가 anon key로 읽힌다는 것이 확인되어(`history` 80행 등), 사용자 결정으로 마이그레이션 ③ `20261011000003_revoke_legacy_access.sql`을 추가했다. §8 객체 전체에서 anon·authenticated·public 권한을 회수한다(DROP 없음). 이 마이그레이션을 적용한 뒤에는 위 롤백 경로를 쓸 수 없다.

## 8. 후속 정리 대상 (사용자 지시 후 진행)

이번 작업 이후 앱이 더 이상 쓰지 않는 DB 객체다. **사용자가 지시하기 전까지 DROP하지 않는다.**

- 테이블: `history`, `calendar`, `bookmarks`
- 뷰: `call_places_with_history`, `call_bookmarks_with_places`
- 함수: `get_bookmarked_places`, `get_places_with_bookmarks`, `get_places_with_name_and_bookmarks`
