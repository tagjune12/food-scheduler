# React + TypeScript 코드 컨벤션

이 문서는 `food-scheduler` 프로젝트에서 실제로 사용 중인 패턴을 기준으로 작성된 코드 컨벤션입니다. 새 코드를 작성하거나 리뷰할 때 기준으로 삼습니다.

## 1. 디렉터리 & 파일 구조

```
src/
├── components/   # 공통/기능별 컴포넌트 (기능 단위 하위 폴더: Map/, calendar/, sidebar/, commons/)
├── context/      # 전역 상태 (React Context + useReducer)
├── lib/
│   └── api/      # 외부 API 연동 (Supabase, Google Calendar, Kakao, User)
├── pages/        # 라우트 단위 페이지
└── types/        # 공용 타입 정의 (Supabase 생성 타입 포함)
```

- 폴더는 기능(도메인) 단위로 묶는다 (`components/calendar`, `components/sidebar` 등). 컴포넌트 종류(예: `buttons/`, `modals/`)로 나누지 않는다.
- 각 기능 폴더에 필요 시 `index.ts`를 두어 공개 API만 재노출한다 (`components/calendar/index.ts`, `components/commons/index.ts` 참고).
- 컴포넌트 파일명은 `PascalCase.tsx`, 그에 대응하는 스타일 파일은 동일한 이름의 `PascalCase.scss`로 짝을 맞춘다 (`Calendar.tsx` ↔ `Calendar.scss`).
- 유틸리티/훅/API 모듈 파일명은 `camelCase.ts` 또는 `snake_case_api.ts`(기존 `*_api.ts` 네이밍 유지, 예: `calendar_api.ts`, `supabase_api.ts`).

## 2. 경로 별칭(Alias)

상대 경로(`../../..`) 대신 [tsconfig.paths.json](../tsconfig.paths.json)에 정의된 별칭을 사용한다.

| 별칭 | 대상 |
|---|---|
| `@src/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@lib/*` | `src/lib/*` |
| `@pages/*` | `src/pages/*` |

같은 폴더 내부 파일 간 import(예: `MapContainer.tsx` → `./Map`)만 상대 경로를 허용한다.

## 3. 컴포넌트: Container / Presentational 패턴

상태·로직이 있는 컴포넌트는 `Container` 접미사를 붙이고, 마크업/스타일만 담당하는 컴포넌트는 접미사 없이 분리한다.

- **Container**: 데이터 fetch, 이벤트 핸들러, ref/상태 관리, Context 구독을 담당. API 호출은 Container에서만 수행한다.
- **Presentational**: props로 받은 데이터와 콜백만 사용해 렌더링. 내부에 `useEffect`로 API를 호출하거나 Context를 직접 구독하지 않는다.

```tsx
// MapContainer.tsx — Container
const MapContainer = ({ state, placeFilter, setPlaceFilter }: MapContainerProps) => {
  const { userId } = useBookMarkState();
  // ... 데이터 로드, 이벤트 핸들러 정의
  return <Map placeFilter={placeFilter} onFilterChange={...} />;
};

// Map.tsx — Presentational
const Map = ({ placeFilter, onFilterChange, filterOptions }: MapProps) => {
  return <div id="map">{/* 마크업만 */}</div>;
};
```

새 기능을 추가할 때도 이 쌍을 유지한다 (`XxxContainer.tsx` + `Xxx.tsx`).

## 4. 상태 관리: Context + useReducer

전역 상태가 필요한 도메인은 `src/context/`에 `useReducer` 기반 Context를 만든다. 아래 형태를 그대로 따른다 ([`BookMarkContext.tsx`](../src/context/BookMarkContext.tsx) 참고).

1. `상태 타입`과 `액션 유니온 타입`을 명시적으로 정의한다. 액션은 `{ type: 'FETCH_X_START' } | { type: 'FETCH_X_SUCCESS'; payload: T } | ...` 형태의 판별 유니온으로 작성한다.
2. `리듀서 함수`는 파일 내부에 private으로 둔다.
3. `상태 Context`와 `Dispatch Context`를 분리해서 만든다 (`XxxStateContext`, `XxxDispatchContext`). 하나로 합치지 않는다.
4. Provider는 `<XxxProvider>` 이름으로 export 하고, 그 안에서 API 호출이 필요한 초기 로딩은 `useEffect`로 수행한다.
5. Context 소비는 항상 커스텀 훅을 통해서만 하고, Provider 밖에서 사용 시 에러를 던지도록 가드를 둔다.

```tsx
export const useBookMarkState = () => {
  const context = useContext(BookmarkStateContext);
  if (context === undefined) {
    throw new Error('useBookMarkState must be used within a BookmarkProvider');
  }
  return context;
};
```

- 상태(`useXState`)와 액션(`useXActions`/`useXDispatch`)을 위한 훅을 분리해서 제공한다. 컴포넌트가 상태만 필요하면 상태 훅만 구독하게 하여 불필요한 리렌더를 줄인다.
- `raw Context` 객체 자체를 export하지 않는다. 반드시 훅을 통해서만 접근하게 한다.

## 5. 타입(TypeScript)

- 객체 형태(props, 상태, API 응답)는 `type`으로 정의한다. 이 프로젝트는 `interface`보다 `type` 별칭을 기본으로 사용한다 (`AuthContextType`처럼 Context 값 타입에 한해 `interface` 예외 허용).
- 공용 도메인 타입은 `src/types/index.d.ts`에 모으고, Supabase 관련 타입은 `src/types/supabase.ts`(자동 생성 파일, 직접 수정 금지)에서 파생한다.
  ```ts
  type PlaceRow = Database['public']['Tables']['places']['Row'];
  ```
- 스키마가 바뀌면 `src/types/supabase.ts`를 Supabase CLI로 재생성하고, 파생 타입(`index.d.ts`)만 필요 시 수정한다.
- `any`는 외부 라이브러리 반환값 등 불가피한 경우가 아니면 사용하지 않는다. 불가피할 경우 최소 범위로 국한한다.
- Props 타입명은 `컴포넌트명 + Props` (`MapContainerProps`), Context 값 타입은 `컴포넌트명 + ContextType` (`AuthContextType`) 규칙을 따른다.

## 6. Import 순서

1. React / 외부 라이브러리 (`react`, `react-router-dom`, `@mui/material` 등)
2. 별칭(`@src`, `@components`, `@lib`, `@pages`) 기반 내부 모듈
3. 상대 경로 (`./Map`)
4. 스타일 시트(`.scss`) — 항상 마지막

## 7. 네이밍

- 컴포넌트: `PascalCase`
- 훅/함수/변수: `camelCase`, 훅은 반드시 `use` 접두사
- Context 액션 타입 문자열: `SCREAMING_SNAKE_CASE` (`FETCH_BOOKMARKS_SUCCESS`) 또는 `camelCase` (`setAccessToken`) — 같은 Context 내에서는 하나의 스타일을 통일해서 사용한다. 새 액션은 그 Context가 기존에 쓰던 스타일을 따른다.
- API 함수: 동사로 시작 (`getRestaurants`, `insertBookmark`, `deleteBookmark`).
- boolean 상태/props는 `is`/`show`/`has` 접두사를 사용한다 (`isShowCalendar`, `showListModal`).

## 8. 주석 & 문서화

- 주석은 "왜" 그렇게 했는지 설명이 필요할 때만 작성한다 (숨은 제약, 특정 버그의 우회, 비직관적 동작). "무엇을 하는지"는 이름으로 드러나야 하며 별도로 설명하지 않는다.
- 함수 상단에 JSDoc을 붙이는 것은 공용 유틸(`src/lib/util.ts`)처럼 여러 곳에서 재사용되는 함수에 한정한다. 컴포넌트 내부 지역 함수에는 붙이지 않는다.
- 디버깅용 `console.log`는 머지 전에 제거한다. 에러 로깅(`console.error`)은 `catch` 블록에서 유지한다.

## 9. 스타일(SCSS)

- 컴포넌트와 1:1로 대응하는 `.scss` 파일을 같은 디렉터리에 둔다.
- 공용 변수/믹스인은 `src/components/commons/_variables.scss`, `_mixins.scss`에 정의하고 각 컴포넌트 스타일에서 `@use`/`@import` 한다.
- 인라인 스타일(`style={{ ... }}`)은 지도 오버레이처럼 동적 값(좌표, 계산된 색상)이 필요한 경우에만 사용하고, 정적 스타일은 `.scss` 클래스로 뺀다.

## 10. 비동기 처리 & 에러 처리

- Supabase/외부 API 호출은 `try/catch`로 감싸고, 실패 시 `console.error`로 로깅한 뒤 호출부가 처리할 수 있는 값(빈 배열 `[]`, `null` 등)을 반환한다. 에러를 삼키지 말고 최소한 로그는 남긴다.
- Google Calendar API처럼 인증이 필요한 요청은 호출 전 토큰 유효성을 검사하고, 실패 시 명확한 한국어 에러 메시지를 던진다 (`throw new Error('유효한 인증 토큰이 없습니다.')`).
- 컴포넌트에서 비동기 함수를 호출할 때는 `useCallback`으로 감싸 의존성 배열을 명시하고, 관련된 `useEffect`의 의존성 배열에 정확히 반영한다.
