# 방문 일정 저장소 전환 (Google Calendar → Supabase) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 방문 일정을 Google Calendar 대신 Supabase `visits` 테이블에 저장하고, 로그인을 Supabase Auth(Google)로 바꿔 RLS로 사용자별 데이터를 보호한다.

**Architecture:** 새 DB 객체(`visits`, `user_bookmarks`, RPC 2개)를 기존 객체 옆에 새 이름으로 만들고 RLS(`user_id = auth.uid()`)를 건다. 프론트엔드는 supabase-js로 직접 CRUD한다. 데스크톱·모바일 캘린더는 공용 훅 `useVisitCalendar`를 쓰고, 세션은 `AuthContext`가 `onAuthStateChange`로 관리한다.

**Tech Stack:** React 18, TypeScript 4.9, Vite 6, supabase-js 2.49 (auth-js 2.69, postgrest-js 1.19), FullCalendar 6, Vitest 3 (신규)

**Spec:** `docs/superpowers/specs/2026-10-06-supabase-visit-schedule-design.md`

## Global Constraints

- **커밋 금지.** 사용자가 지시하기 전까지 `git commit`을 하지 않는다. 각 Task의 마지막 단계는 커밋이 아니라 `git status`로 변경 범위를 확인하는 체크포인트다.
- **DB 객체 삭제 금지.** 사용자가 지시하기 전까지 테이블·뷰·함수에 `drop`이나 파괴적 `alter`를 쓰지 않는다. 기존 `history`, `calendar`, `bookmarks`, `call_places_with_history`, `call_bookmarks_with_places`, `get_bookmarked_places`, `get_places_with_bookmarks`, `get_places_with_name_and_bookmarks`는 그대로 둔다.
- **원격 Supabase 작업은 사용자가 한다.** SQL Editor 실행, 마이그레이션 적용, 대시보드 설정은 사용자가 수행한다. 에이전트는 SQL과 절차를 제시하고 결과를 기다린다 (🛑 표시 단계).
- `src/types/supabase.ts`는 생성 파일이다. 직접 수정하지 말고 Supabase CLI로 재생성한다 (`docs/CODE_CONVENTIONS.md` §5).
- Node `18.19.1`(Volta)을 쓰고, 의존성 설치는 항상 `npm install --legacy-peer-deps`로 한다.
- import는 별칭(`@src/*`, `@components/*`, `@lib/*`, `@pages/*`)을 쓰고 순서는 외부 → 별칭 → 상대경로 → `.scss`다. 같은 폴더 안 파일 간 import만 상대경로를 허용한다.
- 객체 형태는 `type`으로 정의한다. Context 값 타입만 `interface`를 허용한다.
- 디버깅용 `console.log`는 남기지 않는다. `catch`에서는 `console.error`를 남긴다.
- 사용자에게 보이는 문구는 한국어다.
- 셸 명령은 Git Bash 기준이다. PowerShell 5의 `>`는 UTF-16으로 저장하므로 타입 생성 같은 리디렉션은 Git Bash에서 실행한다.
- `docs/`는 `.gitignore`에 포함되어 있다. 스펙과 이 계획 파일은 `git status`에 나오지 않는 것이 정상이다.

## 작업 순서와 이유

DB → 방문 일정(Task 2~4) → 인증(Task 5) → 북마크(Task 6) → 문구·문서(Task 7) → 통합 검증(Task 8) 순서로 진행한다.

일정이 인증보다 먼저인 이유는 컴파일 순서다. `calendar_api.ts`가 `App.tsx`의 `access_token`과 `util.ts`의 토큰 함수를 import한다. 인증을 먼저 바꾸면 일정 작업 전까지 빌드가 깨진다. Task 2~4의 일정 코드는 기존 `AuthContext`의 `isLogin`만 쓰므로 인증 전환 전에도 컴파일된다. 실제 브라우저 동작 확인은 Task 8에서 한 번에 한다.

모든 Task는 끝날 때 `npx tsc`가 통과해야 한다.

## 파일 구조

| 파일 | 상태 | 책임 |
|---|---|---|
| `supabase/migrations/20261006000001_user_bookmarks.sql` | 신규 | `user_bookmarks` + RLS + 새 RPC 2개 |
| `supabase/migrations/20261006000002_visits.sql` | 신규 | `visits` + RLS |
| `src/types/supabase.ts` | 재생성 | Supabase 생성 타입 |
| `src/types/index.d.ts` | 수정 | `VisitRow`, `VisitWithPlace` 추가, `PlaceWithBookmark` 출처 변경 |
| `src/lib/util.ts` (+ `util.test.ts`) | 수정/신규 | `toLocalDateString`, `visitToEvent` 추가, 토큰 함수 삭제 |
| `src/lib/api/visit_api.ts` | 신규 | `visits` CRUD |
| `src/components/calendar/useVisitCalendar.ts` | 신규 | 캘린더 상태·핸들러 공용 훅 |
| `src/components/calendar/{Calendar,MobileCalendar}{,Container}.tsx`, `index.ts` | 수정 | Google 캘린더 선택 제거, 훅 사용 |
| `src/components/commons/Modal.tsx` | 수정 | `addVisit`로 저장 |
| `src/components/commons/{MapCard,RestaurantCard}.tsx` | 수정 | `data-restaurant`에 `id` 추가 |
| `src/context/AuthContext.tsx` | 재작성 | Supabase 세션 |
| `src/context/BookMarkContext.tsx` | 수정 | `useAuth()`로 userId, 새 북마크 API |
| `src/App.tsx`, `src/pages/{LoginPage,MainPage,PrivacyPage}.tsx` | 수정 | 인증 흐름·문구 |
| `src/lib/api/supabase_api.ts` | 수정 | PKCE 클라이언트, 북마크·RPC 전환, 일정·캘린더 함수 삭제 |
| `calendar_api.ts`, `user_api.ts`, `event-utils.tsx`, `TodayRestaurantContext.tsx`, `CalendarListModal{,Container}.tsx`, `CalendarListModal.scss` | 삭제 | Google 의존 코드 |
| `package.json`, `README.md`, `IntroModal.tsx`, 기타 소비처 | 수정 | Vitest, 문서, 문구 |

---

### Task 1: DB 마이그레이션과 타입 재생성

**Files:**
- Create: `supabase/migrations/20261006000001_user_bookmarks.sql`
- Create: `supabase/migrations/20261006000002_visits.sql`
- Regenerate: `src/types/supabase.ts`

**Interfaces:**
- Consumes: 없음
- Produces (생성 타입에 나타나야 하는 것):
  - `Database['public']['Tables']['visits']['Row']` = `{ id: string; user_id: string; place_id: string; visit_date: string; created_at: string }`, Relationships에 `visits_place_id_fkey`(→ `places.id`)
  - `Database['public']['Tables']['user_bookmarks']['Row']` = `{ user_id: string; place_id: string; created_at: string }`, Relationships에 `user_bookmarks_place_id_fkey`
  - `Database['public']['Functions']['get_places_with_my_bookmarks']` (인자 없음)
  - `Database['public']['Functions']['get_places_by_names_with_my_bookmarks']` (`{ p_place_names: string[] }`)
  - 두 함수 모두 places 컬럼 13개 + `bookmarked: string`를 반환한다.

- [ ] **Step 1: 의존성 설치와 기준선 확인**

워크트리에는 `node_modules`가 없다.

```bash
npm install --legacy-peer-deps
npx tsc
```

Expected: `tsc`가 오류 없이 끝난다. 이것이 변경 전 기준선이다. 실패하면 멈추고 사용자에게 보고한다.

- [ ] **Step 2: 🛑 전제 조건 조회 (사용자 수행)**

사용자에게 아래 SQL을 Supabase SQL Editor에서 실행하고 결과를 공유해 달라고 요청한다. 조회만 하므로 데이터는 바뀌지 않는다.

```sql
-- (a) places 컬럼 타입
select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'places' order by ordinal_position;

-- (b) places 제약 조건 (id가 PK인지)
select conname, contype, pg_get_constraintdef(oid) from pg_constraint
where conrelid = 'public.places'::regclass;

-- (c) places RLS 상태와 정책
select relrowsecurity from pg_class where oid = 'public.places'::regclass;
select policyname, roles, cmd, qual from pg_policies
where schemaname = 'public' and tablename = 'places';

-- (d) 기존 RPC 본문
select pg_get_functiondef('public.get_places_with_bookmarks'::regproc);
select pg_get_functiondef('public.get_places_with_name_and_bookmarks'::regproc);
```

결과에 따라 다음과 같이 판단한다.
- (b)에 `id`에 대한 `PRIMARY KEY` 또는 `UNIQUE`가 없으면 **중단**하고 사용자에게 보고한다. 외래키 대신 `place_name`을 저장하는 방식으로 설계를 다시 확인받아야 한다.
- (c)에서 `relrowsecurity = true`인데 `authenticated` 또는 `public`이 SELECT할 수 있는 정책이 없으면 **중단**하고 보고한다. 로그인하면 지도가 비게 된다.
- (d)의 WHERE 절에 북마크 조인 조건 외의 필터(예: `category_group_code in ('FD6','CE7')`)가 있으면, Step 3의 두 함수 `where` 절에 같은 조건을 `p.` 접두사를 붙여 추가한다. `get_places_with_my_bookmarks`에는 `where` 절이 없으므로 새로 만든다.
- (a)는 기록만 해둔다. 새 RPC의 반환 타입은 `%type`으로 places를 따라가므로 따로 손볼 것은 없다.

- [ ] **Step 3: 마이그레이션 ① 작성**

`supabase/migrations/20261006000001_user_bookmarks.sql`:

```sql
-- 이메일 앞부분 user_id를 쓰던 bookmarks를 대체한다.
-- 기존 bookmarks와 관련 뷰·함수는 사용자 지시 전까지 삭제하지 않는다.
create table public.user_bookmarks (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  place_id   text        not null references public.places (id),
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

alter table public.user_bookmarks enable row level security;

-- Supabase 기본 권한(anon/authenticated 전체 허용)을 쓰지 않고 필요한 것만 준다.
revoke all on public.user_bookmarks from anon, authenticated;
-- anon select: 비로그인 상태에서 아래 RPC가 이 테이블을 left join한다.
-- anon용 정책이 없으므로 anon이 실제로 보는 행은 0개다.
grant select on public.user_bookmarks to anon;
grant select, insert, delete on public.user_bookmarks to authenticated;

create policy user_bookmarks_select_own on public.user_bookmarks
  for select to authenticated using (user_id = (select auth.uid()));
create policy user_bookmarks_insert_own on public.user_bookmarks
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy user_bookmarks_delete_own on public.user_bookmarks
  for delete to authenticated using (user_id = (select auth.uid()));

-- get_places_with_bookmarks(p_user_id)를 대체한다. 비로그인이면 전부 'N'.
-- 기존 함수와 같은 이름으로 오버로드하면 PostgREST의 함수 선택이 모호해질 수 있어 새 이름을 쓴다.
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

-- get_places_with_name_and_bookmarks(p_place_names, p_user_id)를 대체한다.
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

Step 2(d)에서 추가 필터를 찾았다면 지금 두 함수에 반영한다.

- [ ] **Step 4: 마이그레이션 ② 작성**

`supabase/migrations/20261006000002_visits.sql`:

```sql
-- Google Calendar 이벤트를 대체하는 방문 일정. 하루 개수 제한이 없으므로 유니크 제약을 두지 않는다.
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

- [ ] **Step 5: 🛑 마이그레이션 적용 (사용자 수행)**

사용자에게 두 파일을 **파일명 순서대로** 적용해 달라고 요청한다. 방법은 둘 중 편한 쪽이다.
- SQL Editor에 각 파일 내용을 붙여넣어 실행한다.
- 또는 `npx supabase link --project-ref <project-ref>` 후 `npx supabase db push`를 실행한다.

적용이 끝나면 아래 확인 SQL의 결과를 받는다.

```sql
select tablename, policyname, cmd, roles from pg_policies
where schemaname = 'public' and tablename in ('visits', 'user_bookmarks')
order by tablename, policyname;
-- 기대: user_bookmarks 3행(SELECT, INSERT, DELETE), visits 4행(SELECT, INSERT, UPDATE, DELETE), roles 모두 {authenticated}

select table_name, grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('visits', 'user_bookmarks')
  and grantee in ('anon', 'authenticated')
order by 1, 2, 3;
-- 기대: user_bookmarks: anon SELECT / authenticated DELETE, INSERT, SELECT
--       visits: authenticated DELETE, INSERT, SELECT (UPDATE는 컬럼 권한이라 여기 나오지 않음)

select count(*) as total, count(*) filter (where bookmarked = 'Y') as bookmarked
from public.get_places_with_my_bookmarks();
-- 기대: total = places 행 수, bookmarked = 0 (SQL Editor에서는 auth.uid()가 null)
```

기대와 다르면 멈추고 사용자와 원인을 확인한다.

- [ ] **Step 6: 타입 재생성**

`project-ref`는 `.env`의 `REACT_APP_SUPABASE_URL`(`https://<project-ref>.supabase.co`)에서 확인한다. 워크트리에 `.env`가 없으면 메인 체크아웃(`E:\GithubProject\food-scheduler\.env`)에 있다. 값을 사용자에게 물어봐도 된다. Git Bash에서 실행한다.

```bash
npx supabase gen types typescript --project-id <project-ref> > src/types/supabase.ts
```

CLI가 로그인되어 있지 않아 실패하면 🛑 사용자에게 `npx supabase login` 후 같은 명령을 실행해 달라고 요청한다. 파일을 손으로 고치지 않는다.

- [ ] **Step 7: 생성 타입 확인**

```bash
grep -n "visits: {\|user_bookmarks: {\|get_places_with_my_bookmarks\|get_places_by_names_with_my_bookmarks\|visits_place_id_fkey\|user_bookmarks_place_id_fkey" src/types/supabase.ts
npx tsc
```

Expected: 6개 패턴이 모두 나온다. `tsc`가 통과한다. 기존 객체 타입은 그대로 남아 있으므로 기존 코드도 컴파일된다.

- [ ] **Step 8: 체크포인트 (커밋하지 않음)**

```bash
git status --short
```

Expected: `supabase/migrations/` 두 파일(untracked)과 `src/types/supabase.ts`(modified)만 바뀌었다.

---

### Task 2: Vitest 도입과 날짜·이벤트 변환 함수 (TDD)

**Files:**
- Modify: `package.json` (scripts, devDependencies)
- Modify: `src/types/index.d.ts`
- Modify: `src/lib/util.ts`
- Test: `src/lib/util.test.ts` (신규)

**Interfaces:**
- Consumes: Task 1의 `Database['public']['Tables']['visits']['Row']`
- Produces:
  - `src/types/index.d.ts`에서 export하는 `type VisitRow`, `type VisitWithPlace = Pick<VisitRow, 'id' | 'visit_date' | 'place_id'> & { places: Pick<PlaceRow, 'place_name'> | null }`
  - `src/lib/util.ts`에서 export하는 `toLocalDateString(date: Date): string`(로컬 `'YYYY-MM-DD'`), `visitToEvent(visit: VisitWithPlace): EventInput`

- [ ] **Step 1: Vitest 설치와 test 스크립트**

```bash
npm install -D vitest@^3 --legacy-peer-deps
```

Vitest 3은 Vite 6과 Node 18을 지원한다. Vitest 4는 Node 20 이상이 필요하므로 쓰지 않는다.

`package.json`의 `scripts`에 `test`를 추가한다.

```json
  "scripts": {
    "start": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
```

Vitest는 `vite.config.ts`를 그대로 읽으므로 별칭(`@lib/*` 등)이 테스트에서도 동작한다. 별도 설정 파일은 만들지 않는다.

- [ ] **Step 2: `VisitWithPlace` 타입 추가**

`src/types/index.d.ts`에서 `PlaceWithBookmark` 정의 바로 아래에 다음을 추가한다.

```ts
type VisitRow = Database['public']['Tables']['visits']['Row'];
type VisitWithPlace = Pick<VisitRow, 'id' | 'visit_date' | 'place_id'> & {
  places: Pick<PlaceRow, 'place_name'> | null;
};
```

같은 파일 맨 아래 `export type { ... }` 목록에 `VisitRow,`와 `VisitWithPlace,`를 추가한다.

```ts
export type {
  Restaurant,
  PlaceRow,
  PlaceWithBookmark,
  VisitRow,
  VisitWithPlace,
  HistoryType,
  JSONResponse,
  NestObjType,
  StringKeyObj,
  AppStoreType,
};
```

- [ ] **Step 3: 실패하는 테스트 작성**

`src/lib/util.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { toLocalDateString, visitToEvent } from '@lib/util';

describe('toLocalDateString', () => {
  it('로컬 날짜를 YYYY-MM-DD로 만든다', () => {
    expect(toLocalDateString(new Date(2026, 9, 6))).toBe('2026-10-06');
  });

  it('한 자리 월·일을 0으로 채운다', () => {
    expect(toLocalDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('로컬 자정 직후에도 그날 날짜를 쓴다 (toISOString의 UTC 밀림 방지)', () => {
    expect(toLocalDateString(new Date(2026, 9, 6, 0, 30))).toBe('2026-10-06');
  });

  it('로컬 자정 직전에도 그날 날짜를 쓴다', () => {
    expect(toLocalDateString(new Date(2026, 9, 6, 23, 59))).toBe('2026-10-06');
  });

  it('월말·연말 경계를 처리한다', () => {
    expect(toLocalDateString(new Date(2026, 1, 28))).toBe('2026-02-28');
    expect(toLocalDateString(new Date(2026, 11, 31))).toBe('2026-12-31');
    expect(toLocalDateString(new Date(2027, 0, 1))).toBe('2027-01-01');
  });
});

describe('visitToEvent', () => {
  it('방문 일정을 FullCalendar 종일 이벤트로 바꾼다', () => {
    expect(
      visitToEvent({
        id: 'visit-1',
        visit_date: '2026-10-06',
        place_id: 'place-1',
        places: { place_name: '한강라멘' },
      }),
    ).toEqual({
      id: 'visit-1',
      title: '한강라멘',
      start: '2026-10-06',
      allDay: true,
    });
  });

  it('식당 정보가 없으면 대체 제목을 쓴다', () => {
    expect(
      visitToEvent({
        id: 'visit-2',
        visit_date: '2026-10-06',
        place_id: 'place-2',
        places: null,
      }).title,
    ).toBe('(알 수 없는 식당)');
  });

  it('식당 이름이 null이면 대체 제목을 쓴다', () => {
    expect(
      visitToEvent({
        id: 'visit-3',
        visit_date: '2026-10-06',
        place_id: 'place-3',
        places: { place_name: null },
      }).title,
    ).toBe('(알 수 없는 식당)');
  });
});
```

- [ ] **Step 4: 테스트가 실패하는지 확인**

```bash
npx vitest run src/lib/util.test.ts
```

Expected: FAIL. `toLocalDateString`, `visitToEvent`가 아직 export되지 않아 `is not a function` 류의 오류가 난다.

- [ ] **Step 5: 구현**

`src/lib/util.ts`의 맨 위 import를 다음으로 바꾼다.

```ts
import type { EventInput } from '@fullcalendar/core';
import type { PlaceWithBookmark, Restaurant, VisitWithPlace } from '@src/types';
```

`getStringDate` 함수 정의 바로 아래에 다음을 추가한다.

```ts
/**
 * Date를 로컬 시간 기준 'YYYY-MM-DD' 문자열로 변환합니다.
 * toISOString()은 UTC 기준이라 KST 00시~09시 사이에는 전날 날짜가 되므로 쓰지 않습니다.
 * @param date 변환할 날짜
 * @returns 'YYYY-MM-DD'
 */
function toLocalDateString(date: Date): string {
  return getStringDate({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date: date.getDate(),
  });
}

/**
 * 방문 일정을 FullCalendar 종일 이벤트로 변환합니다.
 * @param visit places(place_name)이 포함된 visits 행
 * @returns FullCalendar EventInput
 */
function visitToEvent(visit: VisitWithPlace): EventInput {
  return {
    id: visit.id,
    title: visit.places?.place_name ?? '(알 수 없는 식당)',
    start: visit.visit_date,
    allDay: true,
  };
}
```

파일 맨 아래 `export { ... }` 목록에 `toLocalDateString,`와 `visitToEvent,`를 추가한다.

- [ ] **Step 6: 테스트 통과와 타입 확인**

```bash
npm test
npx tsc
```

Expected: 8개 테스트가 모두 PASS한다. `tsc`도 통과한다.

- [ ] **Step 7: 체크포인트 (커밋하지 않음)**

```bash
git status --short
```

Expected: `package.json`, `package-lock.json`, `src/types/index.d.ts`, `src/lib/util.ts`가 modified이고 `src/lib/util.test.ts`가 untracked다.

---

### Task 3: 방문 일정 API와 캘린더 전환

**Files:**
- Create: `src/lib/api/visit_api.ts`
- Create: `src/components/calendar/useVisitCalendar.ts`
- Modify (전체 교체): `src/components/calendar/CalendarContainer.tsx`, `MobileCalendarContainer.tsx`, `Calendar.tsx`, `MobileCalendar.tsx`
- Modify: `src/components/calendar/index.ts`
- Delete: `src/components/calendar/CalendarListModal.tsx`, `CalendarListModalContainer.tsx`, `CalendarListModal.scss`, `src/lib/event-utils.tsx`

**Interfaces:**
- Consumes: `VisitWithPlace`(`@src/types`), `toLocalDateString`, `visitToEvent`(`@lib/util`), `supabase`(`@lib/api/supabase_api`)
- Produces:
  - `visit_api.ts`가 export하는 함수들
    - `getVisits(startDate: string, endDate: string): Promise<VisitWithPlace[] | null>`
    - `addVisit(placeId: string, visitDate: string): Promise<VisitWithPlace | null>`
    - `moveVisit(visitId: string, visitDate: string): Promise<boolean>`
    - `deleteVisit(visitId: string): Promise<boolean>`
    - 실패하면 `null` 또는 `false`를 반환한다.
  - `useVisitCalendar()`(default export)는 `{ events: EventInput[]; handleDatesSet; handleEventClick; handleEventDrop; onVisitAdded: (visit: VisitWithPlace) => void }`를 반환한다.
  - `CalendarProps`(두 프레젠테이션 공통 형태)는 `{ initailEvents?: EventInput[]; handleDatesSet; closeCalendar; handleEventClick; handleEventDrop; onRestaurantListCallback: (visit: VisitWithPlace) => void }`다.

이 Task가 끝나도 `calendar_api.ts`는 `Modal.tsx`, `TodayRestaurantContext.tsx`, `App.tsx`가 아직 쓰므로 남겨둔다 (Task 4에서 삭제).

- [ ] **Step 1: `visit_api.ts` 작성**

`src/lib/api/visit_api.ts`:

```ts
import { supabase } from '@lib/api/supabase_api';
import type { VisitWithPlace } from '@src/types';

const VISIT_SELECT = 'id, visit_date, place_id, places(place_name)';

// 기존 supabase_api와 달리 실패 시 null을 반환해 '일정 없음'([])과 구분한다
export const getVisits = async (
  startDate: string,
  endDate: string,
): Promise<VisitWithPlace[] | null> => {
  try {
    const { data, error } = await supabase
      .from('visits')
      .select(VISIT_SELECT)
      .gte('visit_date', startDate)
      .lt('visit_date', endDate)
      .order('visit_date', { ascending: true });

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in getVisits:', error);
    return null;
  }
};

export const addVisit = async (
  placeId: string,
  visitDate: string,
): Promise<VisitWithPlace | null> => {
  try {
    const { data, error } = await supabase
      .from('visits')
      .insert({ place_id: placeId, visit_date: visitDate })
      .select(VISIT_SELECT)
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in addVisit:', error);
    return null;
  }
};

// RLS로 보이지 않는 행은 오류 없이 0건 처리되므로, 반환 행 수로 성공 여부를 판단한다
export const moveVisit = async (
  visitId: string,
  visitDate: string,
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('visits')
      .update({ visit_date: visitDate })
      .eq('id', visitId)
      .select('id');

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new Error('수정할 방문 일정을 찾을 수 없습니다.');
    }
    return true;
  } catch (error) {
    console.error('Error in moveVisit:', error);
    return false;
  }
};

export const deleteVisit = async (visitId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('visits')
      .delete()
      .eq('id', visitId)
      .select('id');

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new Error('삭제할 방문 일정을 찾을 수 없습니다.');
    }
    return true;
  } catch (error) {
    console.error('Error in deleteVisit:', error);
    return false;
  }
};
```

- [ ] **Step 2: 타입 확인**

```bash
npx tsc
```

Expected: 통과한다. `return data`에서 `places`가 배열로 추론되거나 `SelectQueryError` 타입 오류가 나면, Task 1에서 생성된 `visits`의 `Relationships`에 `visits_place_id_fkey`가 있는지 먼저 확인한다. 없으면 타입 재생성이 잘못된 것이므로 Task 1 Step 6으로 돌아간다.

- [ ] **Step 3: `useVisitCalendar.ts` 작성**

`src/components/calendar/useVisitCalendar.ts`:

```ts
import { useCallback, useRef, useState } from 'react';
import type {
  DatesSetArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core';
import { deleteVisit, getVisits, moveVisit } from '@lib/api/visit_api';
import { toLocalDateString, visitToEvent } from '@lib/util';
import type { VisitWithPlace } from '@src/types';

export default function useVisitCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const latestRequestIdRef = useRef<number>(0);

  const handleDatesSet = useCallback(async (dateInfo: DatesSetArg) => {
    const requestId = ++latestRequestIdRef.current;
    const visits = await getVisits(
      toLocalDateString(dateInfo.start),
      toLocalDateString(dateInfo.end),
    );

    // 달을 빠르게 넘길 때 늦게 도착한 이전 범위의 응답이 현재 화면을 덮어쓰지 않게 한다
    if (requestId !== latestRequestIdRef.current) {
      return;
    }
    if (visits === null) {
      alert('일정을 불러오지 못했습니다.');
      return;
    }
    setEvents(visits.map(visitToEvent));
  }, []);

  const handleEventClick = useCallback(async (clickInfo: EventClickArg) => {
    const { event } = clickInfo;
    if (!window.confirm(`일정을 삭제하시겠습니까? '${event.title}'`)) {
      return;
    }

    const isDeleted = await deleteVisit(event.id);
    if (!isDeleted) {
      alert('일정 삭제에 실패했습니다.');
      return;
    }
    setEvents((prevEvents) => prevEvents.filter((prev) => prev.id !== event.id));
  }, []);

  const handleEventDrop = useCallback(async (dropInfo: EventDropArg) => {
    const { event } = dropInfo;
    if (!event.start || !window.confirm('일정을 변경하시겠습니까?')) {
      dropInfo.revert();
      return;
    }

    const newDate = toLocalDateString(event.start);
    const isMoved = await moveVisit(event.id, newDate);
    if (!isMoved) {
      dropInfo.revert();
      alert('일정 변경에 실패했습니다.');
      return;
    }
    setEvents((prevEvents) =>
      prevEvents.map((prev) =>
        prev.id === event.id ? { ...prev, start: newDate } : prev,
      ),
    );
    alert('일정을 변경하였습니다.');
  }, []);

  const onVisitAdded = useCallback((visit: VisitWithPlace) => {
    setEvents((prevEvents) => [...prevEvents, visitToEvent(visit)]);
  }, []);

  return {
    events,
    handleDatesSet,
    handleEventClick,
    handleEventDrop,
    onVisitAdded,
  };
}
```

- [ ] **Step 4: `Calendar.tsx` 전체 교체**

"📅 달력 가져오기" 버튼, `CalendarListModal`, 쓰지 않는 `calendarRef`와 `handleEvents`를 제거한다.

`src/components/calendar/Calendar.tsx`:

```tsx
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  EventClickArg,
  EventContentArg,
  EventDropArg,
  DatesSetArg,
  EventInput,
} from '@fullcalendar/core';
import type { VisitWithPlace } from '@src/types';
import RestaurantList from './RestaurantListContainer';
import '@components/calendar/Calendar.scss';

export interface CalendarProps {
  initailEvents?: EventInput[];
  handleDatesSet: (dateInfo: DatesSetArg) => void;
  closeCalendar: () => void;
  handleEventClick: (clickInfo: EventClickArg) => void;
  handleEventDrop: (dragInfo: EventDropArg) => void;
  onRestaurantListCallback: (visit: VisitWithPlace) => void;
}

const Calendar = ({
  initailEvents,
  handleDatesSet,
  closeCalendar,
  handleEventClick,
  handleEventDrop,
  onRestaurantListCallback,
}: CalendarProps) => {

  const renderEventContent = (eventContent: EventContentArg) => {
    return (
      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <b>{eventContent.timeText}</b>
        <i style={{ marginLeft: eventContent.timeText ? '4px' : '0' }}>{eventContent.event.title}</i>
      </div>
    );
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-and-list-container">
        <div className="calendar-container">
          <FullCalendar
            datesSet={handleDatesSet}
            customButtons={{
              closeButton: {
                text: 'X',
                click: closeCalendar,
              },
            }}
            plugins={[dayGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: '',
              center: 'title',
              right: 'prev next closeButton',
            }}
            initialView="dayGridMonth"
            events={initailEvents}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            handleWindowResize={true}
            contentHeight={600}
          />
        </div>
        <RestaurantList
          callbackFn={onRestaurantListCallback}
        />
      </div>
    </div>
  );
};

export default Calendar;
```

- [ ] **Step 5: `MobileCalendar.tsx` 전체 교체**

`src/components/calendar/MobileCalendar.tsx`:

```tsx
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  EventClickArg,
  EventContentArg,
  EventDropArg,
  DatesSetArg,
  EventInput,
} from '@fullcalendar/core';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { IconButton } from '@mui/material';
import type { VisitWithPlace } from '@src/types';
import MobileRestaurantList from './MobileRestaurantListContainer';
import './MobileCalendar.scss';

export interface CalendarProps {
  initailEvents?: EventInput[];
  handleDatesSet: (dateInfo: DatesSetArg) => void;
  closeCalendar: () => void;
  handleEventClick: (clickInfo: EventClickArg) => void;
  handleEventDrop: (dragInfo: EventDropArg) => void;
  onRestaurantListCallback: (visit: VisitWithPlace) => void;
}

const MobileCalendar = ({
  initailEvents,
  handleDatesSet,
  closeCalendar,
  handleEventClick,
  handleEventDrop,
  onRestaurantListCallback,
}: CalendarProps) => {

  const renderEventContent = (eventContent: EventContentArg) => {
    return (
      <div className="mobile-calendar-event-content">
        <span className="mobile-calendar-event-text">{eventContent.event.title}</span>
      </div>
    );
  };

  return (
    <div className="mobile-calendar-wrapper">
      <div className="mobile-calendar-header">
        <IconButton onClick={closeCalendar} aria-label="back" className="mobile-back-btn">
          <ArrowBackIosNewIcon />
        </IconButton>
      </div>
      <div className="mobile-calendar-and-list-container">
        <div className="mobile-calendar-container">
          <FullCalendar
            datesSet={handleDatesSet}
            plugins={[dayGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev',
              center: 'title',
              right: 'next',
            }}
            initialView="dayGridMonth"
            events={initailEvents}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            handleWindowResize={true}
            contentHeight="auto"
          />
        </div>
        <MobileRestaurantList
          callbackFn={onRestaurantListCallback}
        />
      </div>
    </div>
  );
};

export default MobileCalendar;
```

기존 파일에서 import만 하고 쓰지 않던 `ArrowForwardIosIcon`은 뺐다.

- [ ] **Step 6: 두 컨테이너 전체 교체**

`src/components/calendar/CalendarContainer.tsx`:

```tsx
import Calendar from './Calendar';
import useVisitCalendar from './useVisitCalendar';

export default function CalendarContainer({
  closeCalendar,
}: {
  closeCalendar: () => void;
}) {
  const {
    events,
    handleDatesSet,
    handleEventClick,
    handleEventDrop,
    onVisitAdded,
  } = useVisitCalendar();

  return (
    <Calendar
      initailEvents={events}
      handleDatesSet={handleDatesSet}
      closeCalendar={closeCalendar}
      handleEventClick={handleEventClick}
      handleEventDrop={handleEventDrop}
      onRestaurantListCallback={onVisitAdded}
    />
  );
}
```

`src/components/calendar/MobileCalendarContainer.tsx`:

```tsx
import MobileCalendar from './MobileCalendar';
import useVisitCalendar from './useVisitCalendar';

export default function MobileCalendarContainer({
  closeCalendar,
}: {
  closeCalendar: () => void;
}) {
  const {
    events,
    handleDatesSet,
    handleEventClick,
    handleEventDrop,
    onVisitAdded,
  } = useVisitCalendar();

  return (
    <MobileCalendar
      initailEvents={events}
      handleDatesSet={handleDatesSet}
      closeCalendar={closeCalendar}
      handleEventClick={handleEventClick}
      handleEventDrop={handleEventDrop}
      onRestaurantListCallback={onVisitAdded}
    />
  );
}
```

- [ ] **Step 7: Google 캘린더 선택 UI와 `event-utils` 삭제**

`src/components/calendar/index.ts`에서 다음 줄을 삭제한다.

```ts
export { default as CalendarListModal } from './CalendarListModalContainer';
```

파일을 삭제한다.

```bash
git rm -q src/components/calendar/CalendarListModal.tsx src/components/calendar/CalendarListModalContainer.tsx src/components/calendar/CalendarListModal.scss src/lib/event-utils.tsx
```

`git rm`은 삭제를 스테이징만 하고 커밋하지 않는다.

- [ ] **Step 8: 잔여 참조 확인과 타입·테스트**

```bash
grep -rn "CalendarListModal\|event-utils\|setInitializeEvents\|fetchGoogleCalendar\|getCalendarList" src
npx tsc
npm test
```

Expected: `grep` 결과가 없다. `tsc`와 테스트가 통과한다.

- [ ] **Step 9: 체크포인트 (커밋하지 않음)**

```bash
git status --short
```

Expected: 위 Files 목록과 일치한다 (삭제 4건은 `D`, 신규 2건은 `??`).

---

### Task 4: 저장 모달 전환과 Google Calendar 일정 코드 삭제

**Files:**
- Modify (전체 교체): `src/components/commons/Modal.tsx`
- Modify: `src/components/commons/MapCard.tsx:118-127`, `src/components/commons/RestaurantCard.tsx:108-117`
- Modify: `src/App.tsx` (import 2줄, Provider 1개)
- Modify: `src/components/sidebar/SideBar.tsx` (import 1줄, 주석 1줄)
- Modify: `src/lib/api/supabase_api.ts` (일정·캘린더 함수 삭제)
- Delete: `src/context/TodayRestaurantContext.tsx`, `src/lib/api/calendar_api.ts`

**Interfaces:**
- Consumes: `addVisit(placeId, visitDate): Promise<VisitWithPlace | null>`, `toLocalDateString`, 기존 `useAuth(): { isLogin: boolean; ... }`, `useModalState().callbackFn?: (event?: unknown) => void`
- Produces: `Modal`은 저장에 성공하면 `callbackFn(visit: VisitWithPlace)`를 호출한다. 캘린더 옆 목록에서 연 경우 이 값이 `useVisitCalendar().onVisitAdded`로 전달된다.

- [ ] **Step 1: `Modal.tsx` 전체 교체**

하루 개수 제한이 없으므로 항상 추가한다. 유니크 제약이 없어서 두 번 클릭하면 중복이 생기므로, 저장 중에는 버튼을 막는다.

`src/components/commons/Modal.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Restaurant } from '@src/types';
import { addVisit } from '@lib/api/visit_api';
import { toLocalDateString } from '@lib/util';
import { useModalDispatch, useModalState } from '@src/context/ModalContext';
import { useAuth } from '@src/context/AuthContext';
import '@components/commons/Modal.scss';

const Modal = ({ restaurant }: { restaurant: Restaurant }) => {
  const modalDispatch = useModalDispatch();
  const modalState = useModalState();
  const { isLogin } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const hideModal = () => {
    modalDispatch({ type: 'hideModal' });
  };

  const onSaveBtnClickListener = async () => {
    if (!isLogin) {
      if (window.confirm('로그인이 필요합니다. 로그인하시겠습니까?')) {
        hideModal();
        navigate('/login', { replace: true });
      }
      return;
    }
    if (!restaurant.id) {
      alert('식당 정보를 찾을 수 없습니다.');
      return;
    }

    setIsSaving(true);
    const visit = await addVisit(restaurant.id, toLocalDateString(new Date()));
    setIsSaving(false);

    if (!visit) {
      alert('일정 추가에 실패했습니다.');
      return;
    }
    modalState.callbackFn?.(visit);
    hideModal();
  };

  return (
    <div className="modal-wrapper">
      <div className="modal-container">
        <h2 className="title">오늘 방문 일정 추가</h2>
        <p>선택하신 식당을 오늘 방문 일정에 추가하시겠습니까?</p>
        <div className="name">{restaurant.name}</div>
        <div className="btn-container">
          <button className="yes" onClick={onSaveBtnClickListener} disabled={isSaving}>
            확인
          </button>
          <button className="no" onClick={hideModal}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
```

- [ ] **Step 2: `data-restaurant`에 `id` 추가**

`MapContainer`는 지도 오버레이의 `.add-event-btn` 클릭을 위임 처리하면서 `data-restaurant` JSON을 그대로 모달에 넘긴다. 이 JSON에 `id`가 없으면 모달이 "식당 정보를 찾을 수 없습니다"로 끝난다.

`src/components/commons/MapCard.tsx`의 `data-restaurant`:

```tsx
          data-restaurant={JSON.stringify({
            id: restaurant.id,
            name: restaurant.place_name,
            tags: restaurant.category_name
              ? restaurant.category_name
                  .split('>')
                  .filter((elem: string) => elem !== '음식점')
              : [],
            address: restaurant.address_name,
            period: 0,
          })}
```

`src/components/commons/RestaurantCard.tsx`의 `data-restaurant`:

```tsx
          data-restaurant={JSON.stringify({
            id: restaurant.id,
            name: restaurant.place_name || restaurant.name,
            tags: restaurant.category_name
              ? restaurant.category_name
                  .split('>')
                  .filter((elem: string) => elem !== '음식점')
              : [],
            address: restaurant.address_name,
            period: 0,
          })}
```

- [ ] **Step 3: `TodayRestaurantContext` 연결 해제**

`src/App.tsx`에서 다음 두 import 줄을 삭제한다.

```tsx
import { getHistory } from '@src/lib/api/calendar_api';
```
```tsx
import { TodayRestaurantProvider } from '@src/context/TodayRestaurantContext';
```

같은 파일의 JSX에서 이 부분을

```tsx
        <BookmarkProvider userId={userId.current ?? ''}>
          <TodayRestaurantProvider userId={userId.current ?? ''}>
            <ModalProvider>
              <MainPage state={state} />
            </ModalProvider>
          </TodayRestaurantProvider>
        </BookmarkProvider>
```

다음으로 바꾼다.

```tsx
        <BookmarkProvider userId={userId.current ?? ''}>
          <ModalProvider>
            <MainPage state={state} />
          </ModalProvider>
        </BookmarkProvider>
```

`src/components/sidebar/SideBar.tsx`에서 다음 두 줄을 삭제한다.

```tsx
import { useTodayRestaurantState } from '@src/context/TodayRestaurantContext';
```
```tsx
  // const todayRestaurantState = useTodayRestaurantState();
```

- [ ] **Step 4: `supabase_api.ts`에서 일정·캘린더 함수 삭제**

`src/lib/api/supabase_api.ts`에서 다음을 통째로 삭제한다. DB 객체는 건드리지 않고 앱 코드만 지운다.
- `// 방문일자 최신순으로 방문 기록 조회` 주석부터 `export const getHistory = ...` 함수 끝까지
- `export const insertHistory = ...` 함수 전체
- 주석 처리된 `// export const updateHistory ...` 블록 전체
- `export const getUserCalendar = ...` 함수 전체
- `export const setUserCalendar = ...` 함수 전체

- [ ] **Step 5: 파일 삭제**

```bash
git rm -q src/context/TodayRestaurantContext.tsx src/lib/api/calendar_api.ts
```

- [ ] **Step 6: 잔여 참조 확인과 타입·테스트**

```bash
grep -rn "calendar_api\|TodayRestaurantContext\|TodayRestaurantProvider\|useTodayRestaurant\|getUserCalendar\|setUserCalendar\|insertHistory\|googleapis" src
npx tsc
npm test
```

Expected: `grep` 결과는 `src/App.tsx`의 **주석 처리된** 한 줄(`// const TodayRestaurantDispatch = useTodayRestaurantDispatch();`)뿐이다. `App.tsx`의 다른 주석 블록도 이미 없는 함수를 가리키지만, 주석이라 컴파일에는 영향이 없다. Task 5에서 `App.tsx`를 교체할 때 모두 사라진다. `tsc`와 테스트가 통과한다.

- [ ] **Step 7: 체크포인트 (커밋하지 않음)**

```bash
git status --short
```

---

### Task 5: Supabase Auth 전환

**Files:**
- Modify: `src/lib/api/supabase_api.ts:7` (클라이언트 생성)
- Modify (전체 교체): `src/context/AuthContext.tsx`, `src/App.tsx`, `src/pages/LoginPage.tsx`
- Modify: `src/pages/MainPage.tsx`, `src/components/commons/maintoolbar/MainToolbarContainer.tsx`, `src/components/sidebar/Bookmark.tsx`, `src/components/sidebar/SideBar.tsx`, `src/context/BookMarkContext.tsx`, `src/lib/util.ts`
- Delete: `src/lib/api/user_api.ts`

**Interfaces:**
- Consumes: `supabase`(`@lib/api/supabase_api`)
- Produces:
  - `useAuth()`는 `AuthContextType = { session: Session | null; userId: string; isLogin: boolean; isAuthLoading: boolean; signInWithGoogle: () => Promise<void>; signOut: () => Promise<void> }`를 반환한다. `userId`는 로그아웃 상태에서 `''`다.
  - `<BookmarkProvider>`는 prop을 받지 않는다. `useBookMarkState().userId`는 계속 제공한다.
  - `setIsLogin`은 더 이상 없다.

이 Task가 끝나도 북마크 API는 기존 `bookmarks` 테이블을 쓴다. `user_id` 값만 UUID 문자열로 바뀐다 (텍스트 컬럼이라 그대로 동작). 새 객체로의 전환은 Task 6에서 한다.

- [ ] **Step 1: Supabase 클라이언트를 PKCE로**

`src/lib/api/supabase_api.ts`의

```ts
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

를 다음으로 바꾼다.

```ts
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { flowType: 'pkce' },
});
```

`detectSessionInUrl`, `persistSession`, `autoRefreshToken`은 기본값(true)을 쓴다. OAuth에서 돌아오면 URL의 `code`를 세션으로 교환하고 localStorage에 저장·갱신한다.

- [ ] **Step 2: `AuthContext.tsx` 전체 교체**

`src/context/AuthContext.tsx`:

```tsx
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@lib/api/supabase_api';

interface AuthContextType {
  session: Session | null;
  userId: string;
  isLogin: boolean;
  isAuthLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    // 구독 직후 INITIAL_SESSION 이벤트가 저장된 세션(또는 OAuth code 교환 결과)과 함께 한 번 온다
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      console.error('Error in signInWithGoogle:', error);
      alert('로그인에 실패했습니다.');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error in signOut:', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        userId: session?.user.id ?? '',
        isLogin: session !== null,
        isAuthLoading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

- [ ] **Step 3: `BookMarkContext.tsx`가 `useAuth()`에서 userId를 읽도록 변경**

`src/context/BookMarkContext.tsx`의 상단 import를 다음으로 바꾼다.

```tsx
import {
  createContext,
  useContext,
  useReducer,
  Dispatch,
  useEffect,
  useMemo,
} from 'react';
import {
  getBookmarks,
  insertBookmark,
  deleteBookmark,
} from '@src/lib/api/supabase_api';
import { useAuth } from '@src/context/AuthContext';
```

`// 초기 상태 (userId는 Provider에서 설정됨)` 주석과 `createInitialState` 함수를 다음으로 바꾼다.

```tsx
// 리듀서는 북마크 목록만 관리하고, userId는 AuthContext에서 매 렌더 가져온다
type BookmarkReducerState = Omit<BookmarkState, 'userId'>;

const initialState: BookmarkReducerState = {
  bookmarks: [],
  loading: false,
  error: null,
};
```

`bookmarkReducer`의 시그니처만 바꾼다. 본문은 그대로 둔다.

```tsx
function bookmarkReducer(
  prevState: BookmarkReducerState,
  action: BookmarkAction,
): BookmarkReducerState {
```

`BookmarkProvider` 전체를 다음으로 바꾼다.

```tsx
// Provider 컴포넌트
export const BookmarkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { userId } = useAuth();
  const [reducerState, dispatch] = useReducer(bookmarkReducer, initialState);
  const state: BookmarkState = useMemo(
    () => ({ ...reducerState, userId }),
    [reducerState, userId],
  );

  // 로그인 사용자가 바뀔 때 북마크 목록 조회
  useEffect(() => {
    // 로그아웃하면 이전 사용자의 북마크가 화면에 남지 않게 비운다
    if (!userId) {
      dispatch({ type: 'FETCH_BOOKMARKS_SUCCESS', payload: [] });
      return;
    }

    const fetchBookmarks = async () => {
      dispatch({ type: 'FETCH_BOOKMARKS_START' });
      try {
        const bookmarks: BookmarkItem[] = await getBookmarks(userId);
        dispatch({ type: 'FETCH_BOOKMARKS_SUCCESS', payload: bookmarks || [] });
      } catch (error) {
        dispatch({
          type: 'FETCH_BOOKMARKS_ERROR',
          payload:
            error instanceof Error
              ? error.message
              : '북마크를 불러오는데 실패했습니다.',
        });
      }
    };

    fetchBookmarks();
  }, [userId]);

  return (
    <BookmarkStateContext.Provider value={state}>
      <BookmarkDispatchContext.Provider value={dispatch}>
        {children}
      </BookmarkDispatchContext.Provider>
    </BookmarkStateContext.Provider>
  );
};
```

`useBookMarkActions`는 이 Task에서 바꾸지 않는다. `state.userId`를 읽는데, 이제 auth 값이 들어 있다.

- [ ] **Step 4: `App.tsx` 전체 교체**

해시 토큰 파싱, `access_token` export, `getUserInfo`로 userId를 구하던 로직, 쓰이지 않던 `isLoading`과 `mapInitDispatch`, Google Calendar 조회 주석 블록을 제거한다. `AuthProvider`는 Router 안 최상단으로 옮긴다.

`src/App.tsx`:

```tsx
import { createContext, useReducer } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from '@pages/MainPage';
import LoginPage from '@pages/LoginPage';
import PrivacyPage from '@pages/PrivacyPage';
import { HistoryType, StringKeyObj } from '@src/types';
import { ModalProvider } from '@src/context/ModalContext';
import { BookmarkProvider } from '@src/context/BookMarkContext';
import { AuthProvider } from '@src/context/AuthContext';
import '@src/App.scss';

export const UseDispatch = createContext<Function>(() => { });

const AuthenticatedApp = () => {
  const initialState = {
    histories: {},
  };
  const reducer = (prevState: typeof initialState, action: StringKeyObj) => {
    switch (action.type) {
      case 'setHistory': {
        return {
          ...prevState,
          histories: { ...(action.payload as HistoryType) },
        };
      }

      default:
        return prevState;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <UseDispatch.Provider value={dispatch}>
      <BookmarkProvider>
        <ModalProvider>
          <MainPage state={state} />
        </ModalProvider>
      </BookmarkProvider>
    </UseDispatch.Provider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthenticatedApp />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
```

- [ ] **Step 5: `LoginPage.tsx` 전체 교체 (Google Calendar 문구 제거 포함)**

`src/pages/LoginPage.tsx`:

```tsx
import { useAuth } from '@src/context/AuthContext';
import './LoginPage.scss';

const LoginPage = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>머먹지</h1>
          <p>'머먹지'는 사용자의 맛집 탐방과 식사 계획을 돕는 도구입니다. 지도에서 고른 식당을 방문 일정으로 기록하고, 캘린더에서 한눈에 관리할 수 있습니다.</p>
          <p>Google 계정으로 로그인하여 방문 일정과 북마크 기능을 사용해보세요.</p>

          <button className="login-button" onClick={signInWithGoogle}>
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
            구글 계정으로 로그인
          </button>

          <div className="login-info">

            <p>로그인하면 다음 기능을 사용할 수 있습니다:</p>
            <ul>
              <li>방문 일정 추가, 이동, 삭제</li>
              <li>식당 북마크</li>
            </ul>
          </div>

          <div className="privacy-policy">
            <a href="https://tagjune12.github.io/privacy_url/" target="_blank" rel="noopener noreferrer">
              개인정보처리방침
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
```

- [ ] **Step 6: `MainPage.tsx` 로그인 확인을 `useAuth()`로**

`src/pages/MainPage.tsx`에서 다음 import를

```tsx
import { getStoredToken } from '@lib/util';
```

다음으로 바꾼다.

```tsx
import { useAuth } from '@src/context/AuthContext';
```

`const isMobile = useMediaQuery('(max-width:768px)');` 바로 아래에 다음을 추가한다.

```tsx
  const { isLogin, isAuthLoading } = useAuth();
```

인트로 모달 `useEffect`를 다음으로 바꾼다.

```tsx
  useEffect(() => {
    if (isAuthLoading || isLogin) {
      return;
    }
    const hideUntil = localStorage.getItem('hide_intro_modal_until');
    if (!hideUntil || new Date().getTime() > parseInt(hideUntil, 10)) {
      setShowIntroModal(true);
    }
  }, [isAuthLoading, isLogin]);
```

`MainToolbar`의 `showCalendar` prop을 다음으로 바꾼다.

```tsx
        showCalendar={() => {
          if (!isLogin) {
            if (window.confirm('로그인이 필요합니다. 로그인하시겠습니까?')) {
              navigate('/login', { replace: true });
            }
            return;
          }
          setIsShowCalendar(true);
        }}
```

- [ ] **Step 7: 로그아웃과 `setIsLogin` 사용처 정리**

`src/components/commons/maintoolbar/MainToolbarContainer.tsx`에서 다음 import를 삭제한다.

```tsx
import { removeStoredUserId } from '@lib/util';
```

`const { isLogin, setIsLogin } = useAuth();`를 다음으로 바꾼다.

```tsx
  const { isLogin, signOut } = useAuth();
```

`handleLogout`을 다음으로 바꾼다.

```tsx
  const handleLogout = async () => {
    if (!window.confirm('로그아웃 하시겠습니까?')) {
      return;
    }
    await signOut();
  };
```

`src/components/sidebar/Bookmark.tsx`의 `const { isLogin, setIsLogin } = useAuth();`를 다음으로 바꾼다.

```tsx
  const { isLogin } = useAuth();
```

`src/components/sidebar/SideBar.tsx`에서 다음 import를 삭제한다.

```tsx
import { getStoredToken } from '@lib/util';
```

- [ ] **Step 8: 토큰 유틸과 `user_api.ts` 삭제**

`src/lib/util.ts`에서 다음 함수 7개의 정의(각 함수 위의 한 줄 주석 포함)를 삭제한다: `saveToken`, `isTokenValid`, `getStoredToken`, `saveUserId`, `getStoredUserId`, `removeStoredUserId`, `removeStoredToken`. 맨 아래 `export { ... }` 목록에서도 같은 7개를 지운다. 결과 export 목록은 다음과 같다.

```ts
export {
  getNumTypeToday,
  getStringDate,
  toLocalDateString,
  visitToEvent,
  convertPlaceToRestaurant,
  convertPlacesToRestaurants,
  convertPlaceRowToRestaurant,
  getStringTypeToday,
};
```

```bash
git rm -q src/lib/api/user_api.ts
```

- [ ] **Step 9: 잔여 참조 확인과 타입·테스트**

```bash
grep -rn "getStoredToken\|saveToken\|isTokenValid\|getStoredUserId\|saveUserId\|removeStoredUserId\|removeStoredToken\|user_api\|setIsLogin\|GOOGLECALENDAR\|GOOGLE_LOGIN_REDIRECT" src
grep -rn "access_token" src
npx tsc
npm test
```

Expected:
- 첫 `grep`은 결과가 없다.
- 두 번째 `grep`은 `src/context/MapInitContext.tsx`만 나온다. 이 파일은 범위 밖이라 그대로 둔다.
- `tsc`와 테스트가 통과한다.

- [ ] **Step 10: 체크포인트 (커밋하지 않음)**

```bash
git status --short
```

---

### Task 6: 북마크를 새 DB 객체로 전환

**Files:**
- Modify: `src/lib/api/supabase_api.ts` (북마크 함수 3개, RPC 함수 2개)
- Modify: `src/types/index.d.ts:4-5` (`PlaceWithBookmark` 출처)
- Modify: `src/context/BookMarkContext.tsx` (API 호출 인자)
- Modify: `src/components/Map/MapContainer.tsx:118-122, 221`
- Modify: `src/components/sidebar/History.tsx:13`

**Interfaces:**
- Consumes: Task 1의 `user_bookmarks`, `get_places_with_my_bookmarks`, `get_places_by_names_with_my_bookmarks` 타입
- Produces:
  - `insertBookmark(placeId: string)`
  - `getBookmarks()`는 `BookmarkItem` 형태(`id` = place id)의 배열을 반환한다.
  - `deleteBookmark(placeId: string)`
  - `getPlacesWithUserBookmarks(categoryFilter?: string)`
  - `getPlacesWithNameAndBookmarks(names: string[], categoryFilter?: string)`
  - `userId` 파라미터는 모두 없어진다. 사용자 필터는 RLS가 처리한다.

- [ ] **Step 1: 북마크 함수 교체**

`src/lib/api/supabase_api.ts`의 `insertBookmark`, `getBookmarks`, `deleteBookmark` 세 함수를 다음으로 교체한다.

```ts
export const insertBookmark = async (placeId: string) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // user_id는 DB 기본값 auth.uid()로 채워진다
    const { data, error } = await supabase
      .from('user_bookmarks')
      .upsert(
        { place_id: placeId },
        { onConflict: 'user_id,place_id', ignoreDuplicates: true },
      )
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in insertBookmark:', error);
    return [];
  }
};

export const getBookmarks = async () => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('user_bookmarks')
      .select(
        'created_at, places(id,address_name,category_group_code,category_group_name,category_name,latitude,longitude,phone,place_name,place_url,road_address_name)',
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return (data ?? []).flatMap((bookmark) =>
      bookmark.places ? [bookmark.places] : [],
    );
  } catch (error) {
    console.error('Error in getBookmarks:', error);
    return [];
  }
};

export const deleteBookmark = async (placeId: string) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('place_id', placeId)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in deleteBookmark:', error);
    return [];
  }
};
```

- [ ] **Step 2: RPC 호출 함수 교체**

같은 파일의 `getPlacesWithUserBookmarks`, `getPlacesWithNameAndBookmarks`를 다음으로 교체한다.

```ts
export const getPlacesWithUserBookmarks = async (categoryFilter?: string) => {
  const query = supabase.rpc('get_places_with_my_bookmarks');

  // 카테고리 필터 적용
  if (categoryFilter && categoryFilter !== 'all') {
    const categoryCode = categoryFilter === 'cafe' ? 'CE7' : 'FD6';
    query.eq('category_group_code', categoryCode);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch places: ${error.message}`);
  }

  return data;
};

export const getPlacesWithNameAndBookmarks = async (
  names: string[],
  categoryFilter?: string,
) => {
  const query = supabase.rpc('get_places_by_names_with_my_bookmarks', {
    p_place_names: names,
  });

  // 카테고리 필터 적용
  if (categoryFilter && categoryFilter !== 'all') {
    const categoryCode = categoryFilter === 'cafe' ? 'CE7' : 'FD6';
    query.eq('category_group_code', categoryCode);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch places: ${error.message}`);
  }

  return data;
};
```

- [ ] **Step 3: `PlaceWithBookmark` 출처 변경**

`src/types/index.d.ts`의

```ts
type PlaceWithBookmark =
  Database['public']['Functions']['get_places_with_bookmarks']['Returns'][number];
```

를 다음으로 바꾼다.

```ts
type PlaceWithBookmark =
  Database['public']['Functions']['get_places_with_my_bookmarks']['Returns'][number];
```

- [ ] **Step 4: 호출부에서 `userId` 인자 제거**

`src/context/BookMarkContext.tsx`:
- `BookmarkProvider`의 `await getBookmarks(userId)`를 `await getBookmarks()`로 바꾼다.
- `useBookMarkActions` 안의 `const { userId } = state;` 줄을 삭제한다.
- `await insertBookmark(userId, placeId)`를 `await insertBookmark(placeId)`로 바꾼다.
- `await deleteBookmark(userId, placeId)`를 `await deleteBookmark(placeId)`로 바꾼다.
- `fetchBookmarks` 안의 `await getBookmarks(userId)`를 `await getBookmarks()`로 바꾼다.

`src/components/Map/MapContainer.tsx`:

```tsx
      const fetchedRestaurants = await getPlacesWithNameAndBookmarks(
        markerTitles,
        placeFilter,
      );
```

```tsx
      const restaurants = await getPlacesWithUserBookmarks(placeFilter);
```

두 `useCallback`의 의존성 배열에 있는 `userId`는 그대로 둔다. 로그인·로그아웃 때 마커의 북마크 표시를 다시 불러오는 트리거다.

`src/components/sidebar/History.tsx`:

```tsx
      const response = await getPlacesWithUserBookmarks();
```

- [ ] **Step 5: 잔여 참조 확인과 타입·테스트**

```bash
grep -rn "from('bookmarks')\|call_bookmarks_with_places\|'get_places_with_bookmarks'\|get_places_with_name_and_bookmarks\|p_user_id" src --include=*.ts --include=*.tsx | grep -v "src/types/supabase.ts"
npx tsc
npm test
```

Expected: `grep` 결과가 없다. `tsc`와 테스트가 통과한다.

- [ ] **Step 6: 체크포인트 (커밋하지 않음)**

```bash
git status --short
```

---

### Task 7: 문구와 문서

**Files:**
- Modify: `src/components/commons/IntroModal.tsx:29`
- Modify (전체 교체): `src/pages/PrivacyPage.tsx`, `README.md`

**Interfaces:**
- Consumes: 없음
- Produces: 없음 (문구만)

- [ ] **Step 1: 인트로 모달 문구**

`src/components/commons/IntroModal.tsx`의

```tsx
          • 구글 계정으로 로그인하고 북마크와 방문 일정을 캘린더에 연동해보세요.
```

를 다음으로 바꾼다.

```tsx
          • 구글 계정으로 로그인하고 북마크와 방문 일정을 관리해보세요.
```

- [ ] **Step 2: 개인정보처리방침 전체 교체**

"외부 서버에 저장하지 않는다"는 이제 사실과 다르므로 삭제한다. 수집 항목과 저장 위치를 반영한다.

`src/pages/PrivacyPage.tsx`:

```tsx
import React from 'react';
import './PrivacyPage.scss';

const PrivacyPage = () => {
    return (
        <div className="privacy-page-container">
            <h1>개인정보처리방침 (Privacy Policy)</h1>

            <section>
                <h2>1. 수집하는 개인정보 항목 (Information We Collect)</h2>
                <p>본 서비스는 구글 로그인을 통해 사용자의 동의 하에 다음 정보를 수집하고 이용합니다.</p>
                <p className="en-section">This service collects and uses the following information with your consent via Google sign-in:</p>
                <ul>
                    <li>구글 계정 이메일 주소 및 계정 식별자 (Google account email address and account identifier)</li>
                    <li>사용자가 등록한 방문 일정: 식당, 방문 날짜 (Visit schedules you create: restaurant and visit date)</li>
                    <li>사용자가 등록한 북마크: 식당 (Bookmarks you create: restaurant)</li>
                </ul>
            </section>

            <section>
                <h2>2. 개인정보의 이용 목적 (How We Use Your Information)</h2>
                <p>수집된 정보는 오직 다음의 목적으로만 사용됩니다.</p>
                <p className="en-section">The collected information is used solely for the following purposes:</p>
                <ul>
                    <li>로그인 및 사용자 식별 (Signing in and identifying the user)</li>
                    <li>방문 일정과 북마크의 저장, 조회, 수정, 삭제 (Storing, viewing, updating, and deleting visit schedules and bookmarks)</li>
                </ul>
            </section>

            <section>
                <h2>3. 개인정보의 보유 및 파기 (Data Retention and Deletion)</h2>
                <p>수집된 정보는 클라우드 데이터베이스 서비스인 Supabase에 저장되며, 본인만 조회하고 변경할 수 있도록 보호됩니다. 방문 일정과 북마크는 사용자가 직접 삭제하거나 탈퇴를 요청할 때까지 보관하며, 탈퇴 요청 시 계정 정보와 함께 지체 없이 파기합니다.</p>
                <p className="en-section">The collected information is stored in Supabase, a cloud database service, and is protected so that only you can view and change it. Visit schedules and bookmarks are retained until you delete them or request account deletion; upon such a request, they are deleted without delay together with your account information.</p>
            </section>

            <section>
                <h2>4. 제3자 제공 및 공유 금지 (Third-Party Disclosure)</h2>
                <p>사용자의 개인정보를 외부에 제공하거나 판매하지 않습니다. 데이터 저장을 위해 Supabase를 이용하며, 수집한 정보는 서비스 기능 수행 이외의 용도로 사용되지 않습니다.</p>
                <p className="en-section">We do not provide or sell your personal information to third parties. We use Supabase to store data, and the collected information is used strictly for the service's functionality and nothing else.</p>
            </section>

            <section>
                <h2>5. 권리 철회 방법 (How to Revoke Access)</h2>
                <p>사용자는 언제든지 구글 계정 설정의 <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">보안 페이지</a>에서 본 서비스의 로그인 연결을 해제할 수 있습니다. 저장된 데이터의 삭제는 아래 문의 이메일로 요청할 수 있습니다.</p>
                <p className="en-section">You can disconnect this service from your Google account at any time through your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">Google Account Security settings</a>. To have your stored data deleted, contact us at the email below.</p>
            </section>

            <hr />

            <section>
                <h2>6. 문의처 (Contact Us)</h2>
                <p>서비스명: 머먹지</p>
                <p>문의 이메일: tagjune12@gmail.com</p>
            </section>

            <footer>
                <p>© 2026 tagjune12. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default PrivacyPage;
```

개인정보처리방침은 법적 문서이므로 Task 8 보고 때 사용자에게 문구 검토를 요청한다.

- [ ] **Step 3: README 전체 교체**

`README.md`:

````markdown
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

1. **마이그레이션 적용**: `supabase/migrations/`의 SQL을 파일명 순서대로 적용합니다 (SQL Editor 또는 `npx supabase db push`).
2. **Google Cloud Console**: OAuth 클라이언트의 승인된 리디렉션 URI에 `https://<project-ref>.supabase.co/auth/v1/callback`을 추가합니다.
3. **Supabase 대시보드 → Authentication → Providers → Google**: 활성화하고 클라이언트 ID와 시크릿을 입력합니다.
4. **Supabase 대시보드 → Authentication → URL Configuration**: Site URL과 Redirect URLs에 `http://localhost:3000`과 운영 도메인을 등록합니다.
5. **타입 재생성**: 스키마를 바꾼 뒤에는 `npx supabase gen types typescript --project-id <project-ref> > src/types/supabase.ts`를 실행합니다. 생성 파일이므로 직접 수정하지 않습니다. PowerShell 5에서는 `>`가 UTF-16으로 저장하므로 Git Bash 등에서 실행하세요.

### 설치 및 실행

```bash
# @types/node는 이전 버전(^16)을 유지하므로 vite의 peer 범위와 충돌한다 — 항상 이 플래그로 설치한다
npm install --legacy-peer-deps

# 개발 서버 실행 (http://localhost:3000)
npm start

# 단위 테스트
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
  - 로그인 상태는 `AuthContext`(`session`, `userId`, `isLogin`)로 전역 관리합니다.
  - 캘린더 버튼을 누르거나 일정을 저장할 때 미로그인이면 로그인 페이지로 안내합니다.

### 데이터 모델

| 객체 | 용도 |
|---|---|
| `visits` | 방문 일정 (`user_id`, `place_id` → `places.id`, `visit_date`) |
| `user_bookmarks` | 북마크 (`user_id`, `place_id`) |
| `get_places_with_my_bookmarks()` | 지도용 식당 목록 + 내 북마크 여부 |
| `get_places_by_names_with_my_bookmarks(p_place_names)` | 클러스터 목록용 식당 + 내 북마크 여부 |

사용자 데이터는 RLS로 `auth.uid()`가 일치하는 행만 접근할 수 있습니다. 이전 Google Calendar 방식에서 쓰던 `history`, `calendar`, `bookmarks` 테이블과 관련 뷰·함수는 DB에 남아 있지만 앱에서 쓰지 않습니다.

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
````

- [ ] **Step 4: 잔여 문구 확인**

```bash
grep -rn "구글 캘린더\|Google Calendar\|캘린더에 연동\|캘린더 연동" src README.md
npx tsc
```

Expected: `grep` 결과가 없다. `tsc`가 통과한다.

- [ ] **Step 5: 체크포인트 (커밋하지 않음)**

```bash
git status --short
```

---

### Task 8: 통합 검증

**Files:** 코드 변경 없음 (발견된 결함 수정은 해당 Task의 파일에서 한다)

**Interfaces:**
- Consumes: Task 1~7의 모든 결과
- Produces: 검증 결과 보고

- [ ] **Step 1: 자동 검증**

```bash
npm test
npm run build
```

Expected: 테스트 8개가 PASS한다. `tsc && vite build`가 오류 없이 `build/`를 만든다.

- [ ] **Step 2: Google 의존 코드 잔여 확인**

```bash
grep -rn "googleapis\|accounts.google.com\|calendar_api\|access_token\|getStoredUserId\|TodayRestaurantContext" src
```

Expected: `src/context/MapInitContext.tsx`의 `access_token` 필드만 나온다 (범위 밖).

- [ ] **Step 3: 🛑 대시보드 설정 (사용자 수행)**

사용자에게 다음 설정을 요청하고 완료 여부를 확인받는다.
1. Google Cloud Console: OAuth 클라이언트의 승인된 리디렉션 URI에 `https://<project-ref>.supabase.co/auth/v1/callback` 추가
2. Supabase 대시보드 → Authentication → Providers → Google: 활성화, 클라이언트 ID/시크릿 입력
3. Supabase 대시보드 → Authentication → URL Configuration: Site URL과 Redirect URLs에 `http://localhost:3000` 등록

- [ ] **Step 4: 🛑 `.env` 준비**

워크트리에 `.env`가 없으면, 메인 체크아웃의 `E:\GithubProject\food-scheduler\.env`를 워크트리 루트로 복사해도 되는지 사용자에게 묻는다. 비밀 값이 든 파일이므로 승인을 받는다. Google 관련 두 변수는 남아 있어도 동작에 영향이 없다.

- [ ] **Step 5: 개발 서버 실행**

`.claude/launch.json`에 다음 설정을 추가하거나 확인한 뒤 preview 도구로 띄운다.

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "dev", "runtimeExecutable": "npm", "runtimeArgs": ["start"], "port": 3000 }
  ]
}
```

또는 사용자가 직접 `npm start`를 실행해도 된다. Google 로그인 단계는 사용자가 직접 한다. 에이전트는 비밀번호를 입력하지 않는다.

- [ ] **Step 6: 🛑 수동 확인 체크리스트 (사용자와 함께)**

각 항목의 결과를 기록한다.
1. Google 로그인 → `/`로 돌아와 로그인 상태가 된다. 새로고침해도 유지된다.
2. 지도 마커 카드의 "오늘은 이거다"로 일정을 추가할 수 있다.
3. 클러스터 목록 모달에서 일정을 추가할 수 있다.
4. 캘린더 옆 식당 목록에서 일정을 추가하면 캘린더에 바로 나타난다.
5. 같은 날에 일정 여러 개를 추가할 수 있다.
6. 드래그로 날짜를 옮기면 새로고침 후에도 유지된다. 확인창에서 취소하면 원위치된다.
7. 일정을 클릭해 삭제하면 새로고침 후에도 없다.
8. 북마크를 추가·삭제하면 사이드바 목록과 지도 별 표시에 반영된다.
9. 로그아웃하면 사이드바 북마크가 비워진다. 캘린더 버튼과 저장 모달이 로그인 안내를 띄운다. 지도 탐색은 그대로 된다.
10. RLS (로그아웃 상태): 브라우저 콘솔이나 preview의 JavaScript 도구로 `supabase.from('visits').select('*')`를 실행하면 권한 오류(`42501`) 또는 빈 결과가 나온다.
11. RLS (다른 계정): 사용자가 가능하면 다른 Google 계정으로 로그인해 첫 계정의 일정·북마크가 보이지 않는지 확인한다.

실패한 항목이 있으면 superpowers:systematic-debugging으로 원인을 찾고, 해당 Task의 파일에서 고친 뒤 Step 1부터 다시 확인한다.

- [ ] **Step 7: 최종 보고 (커밋하지 않음)**

```bash
git status --short
```

사용자에게 보고할 내용:
- 자동·수동 검증 결과
- 변경 파일 목록
- 개인정보처리방침 문구 검토 요청
- 저장소 밖에서 사용자가 할 일: 외부 개인정보처리방침 페이지(`tagjune12.github.io/privacy_url`) 수정, 운영 도메인을 Supabase Redirect URLs에 등록
- 후속 정리 대상(스펙 §8, 지시 후 진행)
- 커밋은 사용자 지시를 기다린다는 점. `docs/`는 gitignore 대상이라 스펙·계획을 커밋하려면 `git add -f`가 필요하다는 점
