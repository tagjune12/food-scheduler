# CRA(craco) → Vite 마이그레이션 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@components/...` 형태의 별칭 import를 유지한 채 craco와 react-scripts 의존을 제거하고 빌드 도구를 Vite 6으로 교체한다.

**Architecture:** `vite.config.ts`가 `tsconfig.paths.json`을 직접 읽어 `resolve.alias`를 생성하므로 별칭 정의는 한 파일에 유지된다. 환경변수는 `loadEnv` + `define`으로 `process.env.REACT_APP_*`를 리터럴 치환해 소스·`.env`·배포 환경변수를 무수정으로 둔다. SCSS 파일 내부의 별칭 경유 `@import`는 상대경로로 선제 전환해 sass 경로 해석 의존을 제거한다.

**Tech Stack:** Vite 6, `@vitejs/plugin-react` 4, dart-sass(`sass`), TypeScript 4.9.5, React 18

**Spec:** [docs/superpowers/specs/2026-09-02-vite-migration-design.md](../specs/2026-09-02-vite-migration-design.md)

## Global Constraints

- 번들러: `vite@^6` (Vite 7 금지 — Node 20.19+ 요구)
- Node: `package.json`의 `volta.node`는 `18.19.1`로 **유지**. 변경 금지
- 환경변수: `REACT_APP_` 접두사 **유지**. 소스의 `process.env.REACT_APP_*` 6곳, 로컬 `.env`, 배포 환경변수 모두 무수정
- dev 서버: 포트 `3000` + `strictPort: true` (Kakao 도메인 허용목록·Google OAuth 리디렉트 URI가 `http://localhost:3000`에 등록됨)
- 빌드 산출물: `build.outDir`은 `build` (Vite 기본값 `dist` 금지 — 배포처 publish 디렉터리 유지)
- 별칭 단일 출처: `tsconfig.paths.json`. 별칭을 `vite.config.ts`에 하드코딩 금지
- `vite-tsconfig-paths` 플러그인 사용 금지 (SCSS import에 적용되지 않음)
- 비목표(하지 말 것): SCSS `@import` → `@use` 전환, 미사용 별칭(`@data`/`@assets`/`@styles`/`@containers`) 제거, vitest·eslint 인프라 구축, 의존성(`i`, `@types/navermaps`) 정리, 런타임 의존성 버전 업그레이드

## 검증 방식에 대한 참고

이 저장소에는 테스트 파일이 0개이고, 이 작업은 빌드 도구 교체다. 따라서 일반적인 TDD의 "실패하는 테스트 작성 → 통과" 순환은 적용되지 않는다. **각 태스크의 테스트 사이클은 빌드/실행 검증**(`sass` 컴파일, `tsc --noEmit`, `vite build`, 브라우저 동작 확인)이며, 각 단계는 실행할 명령과 **기대 출력**을 명시한다. 기대 출력과 다르면 다음 태스크로 진행하지 말 것.

---

### Task 1: package.json 의존성·스크립트 교체

CRA 툴체인을 제거하고 Vite 툴체인을 설치한다. 이 태스크를 먼저 하는 이유는 `node-sass@8`이 로컬 Node(v24)에서 설치되지 않아, 이걸 먼저 걷어내지 않으면 워크트리에서 `npm install` 자체가 실패하기 때문이다.

**Files:**
- Modify: `package.json`
- Delete: `craco.config.js`

**Interfaces:**
- Produces: npm 스크립트 `start` / `build` / `preview`. 이후 모든 태스크가 이 이름을 사용한다.
- Produces: `node_modules/`에 `vite`, `@vitejs/plugin-react`, `sass` 설치. Task 2는 `sass`, Task 3은 `vite`를 사용한다.

- [ ] **Step 1: `package.json`을 아래 내용으로 교체**

`dependencies`에서 `craco`·`react-scripts` 제거, `devDependencies`에서 `@craco/craco`·`@craco/types`·`craco-alias`·`react-app-alias`·`node-sass` 제거 후 `vite`·`@vitejs/plugin-react`·`sass` 추가, `scripts` 교체, `eslintConfig` 블록 제거. `browserslist`와 `volta`는 그대로 둔다.

```json
{
  "name": "food-scheduler",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "@fullcalendar/core": "^6.1.6",
    "@fullcalendar/daygrid": "^6.1.6",
    "@fullcalendar/interaction": "^6.1.6",
    "@fullcalendar/moment": "^6.1.6",
    "@fullcalendar/react": "^6.1.6",
    "@mui/icons-material": "^6.4.8",
    "@mui/material": "^6.4.8",
    "@supabase/supabase-js": "^2.49.4",
    "@types/node": "^16.18.12",
    "@types/react": "^18.0.28",
    "@types/react-bootstrap": "^0.32.32",
    "@types/react-dom": "^18.0.11",
    "@types/react-helmet": "^6.1.6",
    "bootstrap": "^5.2.3",
    "qs": "^6.11.1",
    "react": "^18.2.0",
    "react-bootstrap": "^2.7.2",
    "react-dom": "^18.2.0",
    "react-helmet": "^6.1.0",
    "react-icons": "^4.10.1",
    "react-router-dom": "^6.30.1",
    "typescript": "^4.9.5"
  },
  "scripts": {
    "start": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@types/navermaps": "^3.6.4",
    "@vitejs/plugin-react": "^4",
    "i": "^0.3.7",
    "sass": "^1",
    "supabase": "^2.20.12",
    "vite": "^6"
  },
  "volta": {
    "node": "18.19.1"
  }
}
```

- [ ] **Step 2: 죽은 craco 설정 파일 삭제**

```bash
git rm craco.config.js
```

- [ ] **Step 3: 설치**

```bash
npm install
```

기대 출력: 에러 없이 완료. `node-sass` 관련 `gyp`/Python 빌드 에러가 나오면 Step 1의 `node-sass` 제거가 누락된 것이므로 되돌아가 확인할 것.

- [ ] **Step 4: 설치 결과 검증**

```bash
npx vite --version && npx sass --version && npm ls react-scripts craco node-sass 2>&1 | tail -5
```

기대 출력: `vite/6.x.x`, sass 버전(1.80 이상 — `silenceDeprecations` 옵션에 필요), 그리고 `react-scripts`/`craco`/`node-sass`는 `(empty)` 또는 미설치로 표시.

- [ ] **Step 5: 커밋**

```bash
git add package.json package-lock.json
git commit -m "build: CRA 툴체인을 Vite 툴체인으로 교체

react-scripts, craco, craco-alias, react-app-alias, node-sass 제거.
vite 6, @vitejs/plugin-react, dart-sass 추가. eslintConfig 블록은
react-scripts가 제공하던 프리셋에 의존하므로 함께 제거."
```

이 시점에서 앱은 실행되지 않는다(Vite 설정이 아직 없음). Task 3에서 복구된다.

---

### Task 2: SCSS 별칭 import를 상대경로로 전환

`_variables.scss`와 `_mixins.scss`는 `src/components/commons/`에 있다. 6개 파일 12줄을 상대경로로 바꾼다. 이 변경은 Vite와 무관하게 dart-sass 단독으로 검증할 수 있어, 빌드 교체와 원인이 섞이지 않는다.

**주의:** TSX 파일의 `import '@components/sidebar/SideBar.scss'` 같은 구문은 **건드리지 않는다**. 그것은 JS 모듈 그래프의 import이고 Vite 코어 리졸버가 `resolve.alias`로 처리한다. 이 태스크의 대상은 `.scss` 파일 **내부**의 sass `@import`뿐이다.

**Files:**
- Modify: `src/components/commons/Mapcard.scss:1-2`
- Modify: `src/components/commons/Modal.scss:1-2`
- Modify: `src/components/commons/RestaurantCard.scss:1-2`
- Modify: `src/components/sidebar/History.scss:1-2`
- Modify: `src/components/sidebar/SideBar.scss:1-2`
- Modify: `src/components/sidebar/TodayRestaurant.scss:1-2`

**Interfaces:**
- Produces: SCSS가 별칭에 의존하지 않는 상태. Task 3의 `resolve.alias`는 TS/TSX만 담당하면 된다.

- [ ] **Step 1: 전환 전 상태 기록**

```bash
grep -rn "@import '@" --include=*.scss src
```

기대 출력: 12줄 (`Mapcard.scss` 2, `Modal.scss` 2, `RestaurantCard.scss` 2, `History.scss` 2, `SideBar.scss` 2, `TodayRestaurant.scss` 2). 이 목록을 Step 4에서 대조한다.

- [ ] **Step 2: `commons/` 3개 파일 수정 (같은 디렉터리 → `./`)**

`src/components/commons/Mapcard.scss` 1-2행:

```scss
@import './variables';
@import './mixins';
```

`src/components/commons/Modal.scss` 1-2행 (2행은 주석 상태 유지, 경로만 갱신):

```scss
@import './variables';
// @import './mixins';
```

`src/components/commons/RestaurantCard.scss` 1-2행:

```scss
@import './variables';
@import './mixins';
```

- [ ] **Step 3: `sidebar/` 3개 파일 수정 (상위 디렉터리 경유 → `../commons/`)**

`src/components/sidebar/History.scss`, `src/components/sidebar/SideBar.scss`, `src/components/sidebar/TodayRestaurant.scss` 각각의 1-2행을 동일하게 수정:

```scss
@import '../commons/variables';
@import '../commons/mixins';
```

- [ ] **Step 4: 별칭 잔재 확인**

```bash
grep -rn "@import '@" --include=*.scss src; echo "exit=$?"
```

기대 출력: 매칭 없음, `exit=1`.

- [ ] **Step 5: dart-sass로 6개 파일 개별 컴파일 검증**

```bash
for f in src/components/commons/Mapcard.scss src/components/commons/Modal.scss src/components/commons/RestaurantCard.scss src/components/sidebar/History.scss src/components/sidebar/SideBar.scss src/components/sidebar/TodayRestaurant.scss; do npx sass --no-source-map "$f" > /dev/null && echo "OK   $f" || echo "FAIL $f"; done
```

기대 출력: 6줄 모두 `OK`. `Error: Can't find stylesheet to import` 가 나오면 경로가 틀린 것이다. `@import` deprecation 경고는 stderr로 나가고 무시해도 되지만, `FAIL`이 아닌지만 확인할 것.

- [ ] **Step 6: 커밋**

```bash
git add src/components/commons/Mapcard.scss src/components/commons/Modal.scss src/components/commons/RestaurantCard.scss src/components/sidebar/History.scss src/components/sidebar/SideBar.scss src/components/sidebar/TodayRestaurant.scss
git commit -m "style: SCSS의 별칭 경유 @import를 상대경로로 전환

Vite의 sass 별칭 해석에 대한 의존을 제거한다. dart-sass 단독
컴파일로 6개 파일 모두 검증했다. TSX에서 SCSS를 별칭으로 import하는
구문은 Vite 코어 리졸버가 처리하므로 변경하지 않았다."
```

---

### Task 3: Vite 설정과 진입점 구성

`vite.config.ts`를 만들고 `index.html`을 루트로 옮겨 앱이 다시 실행되게 한다.

**중요:** `public/index.html`은 반드시 **이동**해야 한다(복사가 아니다). `public/`에 남겨두면 Vite가 이를 정적 에셋으로 취급해 빌드 산출물의 `index.html`을 덮어쓴다.

**Files:**
- Create: `vite.config.ts`
- Create: `src/vite-env.d.ts`
- Move: `public/index.html` → `index.html` (이동 후 수정)
- Delete: `src/react-app-env.d.ts`

**Interfaces:**
- Consumes: Task 1의 `vite`·`@vitejs/plugin-react` 설치, `start` 스크립트
- Consumes: Task 2가 만든 "SCSS가 별칭에 의존하지 않는" 상태
- Produces: 동작하는 dev 서버(`http://localhost:3000`). Task 4·5가 이를 사용한다.

- [ ] **Step 1: `vite.config.ts` 생성**

```ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const { compilerOptions } = JSON.parse(
  readFileSync(path.resolve(__dirname, 'tsconfig.paths.json'), 'utf-8'),
);

const alias = Object.entries(
  compilerOptions.paths as Record<string, string[]>,
).map(([key, [value]]) => ({
  find: key.replace(/\/\*$/, ''),
  replacement: path.resolve(__dirname, value.replace(/\/\*$/, '')),
}));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    plugins: [react()],
    resolve: { alias },
    define: {
      'process.env': '({})',
      ...Object.fromEntries(
        Object.entries(env).map(([key, value]) => [
          `process.env.${key}`,
          JSON.stringify(value),
        ]),
      ),
    },
    envPrefix: 'REACT_APP_',
    server: { port: 3000, strictPort: true },
    build: { outDir: 'build' },
    css: {
      preprocessorOptions: {
        scss: { silenceDeprecations: ['import'] },
      },
    },
  };
});
```

`'process.env': '({})'`의 역할은 `.env`에 없는 변수가 `process is not defined` 런타임 에러가 되는 것을 막고 CRA와 동일하게 `undefined`로 평가되게 하는 것이다. 괄호를 씌운 이유는 `{}`가 블록으로 파싱될 여지를 없애기 위함이다. **이 폴백이 개별 변수 치환보다 우선 적용되면 모든 환경변수가 `undefined`가 되므로, Task 4 Step 4에서 반드시 실제 주입 여부를 확인한다.**

- [ ] **Step 2: `index.html`을 루트로 이동**

```bash
git mv public/index.html index.html
```

- [ ] **Step 3: `index.html` 수정 — 아래 내용으로 교체**

`%PUBLIC_URL%/`를 `/`로 바꾸고(3곳) `</body>` 직전에 module 스크립트를 추가한다.

```html
<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="utf-8" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#000000" />
  <meta name="description" content="맛집 방문 기록을 관리하고 다음 방문을 계획할 수 있는 웹 애플리케이션" />
  <meta name="google-site-verification" content="NKXWPUaMm7K3lSVjaTwTuRHM45-lsEoEswtMtL8VQTk" />
  <link rel="apple-touch-icon" href="/logo192.png" />
  <link rel="manifest" href="/manifest.json" />
  <title>머먹지</title>
</head>

<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
  <script type="module" src="/src/index.tsx"></script>
</body>

</html>
```

- [ ] **Step 4: 타입 선언 파일 교체**

`src/vite-env.d.ts` 생성:

```ts
/// <reference types="vite/client" />
```

그리고 react-scripts 참조 삭제:

```bash
git rm src/react-app-env.d.ts
```

- [ ] **Step 5: 타입 체크**

```bash
npx tsc --noEmit
```

기대 출력: 출력 없음(에러 0). 에러가 나면 마이그레이션이 유발한 것인지 기존 에러인지 구분해 보고할 것 — `git stash` 없이 판단이 어려우면 에러 메시지 전문을 남기고 진행 여부를 물을 것.

- [ ] **Step 6: dev 서버 기동 확인**

```bash
npm start
```

기대 출력: `VITE v6.x.x ready in ...` 와 `Local: http://localhost:3000/`. 포트가 3000이 아니면 `strictPort` 설정이 누락된 것이다. 확인 후 서버는 Task 4에서 계속 쓰므로 **종료하지 말 것**(백그라운드로 실행할 것).

- [ ] **Step 7: 커밋**

```bash
git add vite.config.ts index.html src/vite-env.d.ts
git commit -m "build: Vite 설정과 진입점 구성

vite.config.ts가 tsconfig.paths.json을 읽어 resolve.alias를 생성하므로
별칭 정의는 단일 출처로 유지된다. 환경변수는 loadEnv + define으로
process.env.REACT_APP_* 를 리터럴 치환해 소스를 무수정으로 둔다.
index.html은 루트로 이동했다 — public/에 남기면 Vite가 정적 에셋으로
취급해 빌드 산출물을 덮어쓴다."
```

---

### Task 4: dev 환경 기능 검증

실제 API 키로 앱이 동작하는지, 특히 환경변수 6개가 번들에 주입되는지 확인한다.

**Files:**
- 없음 (검증 전용 태스크. `.env`는 gitignore 대상이므로 커밋하지 않는다)

**Interfaces:**
- Consumes: Task 3의 dev 서버

- [ ] **Step 1: 본 저장소의 `.env`를 워크트리로 복사**

워크트리에는 `.env`가 없다. 본 저장소(`E:/GithubProject/food-scheduler/.env`, 9줄)에서 복사한다. `.gitignore`에 `.env`가 있어 커밋되지 않는다.

```bash
cp "E:/GithubProject/food-scheduler/.env" .env && grep -c . .env
```

기대 출력: `9`

- [ ] **Step 2: dev 서버 재시작**

`.env`는 서버 기동 시 `loadEnv`로 읽히므로 Task 3에서 띄운 서버를 재시작해야 반영된다.

```bash
npm start
```

기대 출력: `Local: http://localhost:3000/`

- [ ] **Step 3: 브라우저로 접속해 콘솔 확인**

Browser 도구로 `http://localhost:3000` 접속 후 `read_console_messages`(`onlyErrors: true`) 확인.

기대 결과: 에러 0건. `process is not defined`가 보이면 Step 1의 `.env` 복사 또는 `vite.config.ts`의 `define` 설정을 확인할 것. `Failed to resolve import "@src/..."` 류가 보이면 `resolve.alias` 생성 로직을 확인할 것.

- [ ] **Step 4: 환경변수 주입 검증 (가장 중요)**

`read_network_requests`로 `dapi.kakao.com` 요청의 URL을 확인한다.

기대 결과: URL이 `//dapi.kakao.com/v2/maps/sdk.js?appkey=<실제 키 문자열>&libraries=...` 형태.
**실패 신호:** `appkey=undefined` — 이 경우 `define`의 `'process.env': '({})'` 폴백이 개별 변수 치환보다 우선 적용된 것이다. 대응: `vite.config.ts`의 `define`에서 `'process.env': '({})'` 줄을 제거하고 재시작해 다시 확인한다. 폴백을 제거하면 미정의 변수의 실패 모드가 `undefined`에서 런타임 에러로 바뀌지만, 환경변수가 실제로 주입되는 것이 우선이다. 제거했다면 그 사실을 Task 6의 README와 스펙 §4.2에 반영할 것.

- [ ] **Step 5: 지도·검색·캘린더 렌더 확인**

Browser 도구로 확인:
1. 메인 페이지에 지도가 렌더되고 마커가 표시되는지
2. 상단 툴바 검색창에 식당명을 입력했을 때 자동완성 목록이 뜨는지 (Supabase 연결 검증)
3. `/login` 경로가 렌더되는지 (Google OAuth 클라이언트 ID 주입 검증 — 실제 로그인까지 수행할 필요는 없다)

기대 결과: 3개 모두 정상. Supabase 요청이 401/네트워크 에러면 `.env`의 키 문제이므로 마이그레이션과 분리해 보고할 것.

- [ ] **Step 6: SCSS 스타일 적용 확인**

`_variables.scss`/`_mixins.scss`를 사용하는 화면의 스타일이 깨지지 않았는지 확인한다: 사이드바(`SideBar.scss`), 식당 카드(`RestaurantCard.scss`), 모달(`Modal.scss`), 오늘의 식당(`TodayRestaurant.scss`).

기대 결과: 배경색·간격·폰트가 적용된 상태. 스타일이 전부 빠져 보이면 Task 2의 상대경로 전환 또는 TSX의 SCSS import 해석을 확인할 것.

- [ ] **Step 7: 커밋할 것이 없음을 확인**

```bash
git status --short
```

기대 출력: `.env`가 추적되지 않은 상태로도 나타나지 않아야 한다(`.gitignore` 적용 확인). 다른 변경이 없으면 이 태스크는 커밋 없이 종료한다. Step 4에서 `vite.config.ts`를 수정했다면 그 변경만 커밋한다.

---

### Task 5: 프로덕션 빌드 검증

**Files:**
- 없음 (검증 전용 태스크)

**Interfaces:**
- Consumes: Task 1의 `build`·`preview` 스크립트, Task 3의 `vite.config.ts`

- [ ] **Step 1: 프로덕션 빌드**

```bash
npm run build
```

기대 출력: `tsc`가 조용히 통과한 뒤 `vite build`가 `build/` 디렉터리에 산출물을 생성하며 `✓ built in ...` 출력. `dist/`가 생성되면 `build.outDir` 설정이 누락된 것이다.

- [ ] **Step 2: 배포 필수 파일 포함 확인**

```bash
ls build && echo "--- _redirects ---" && cat build/_redirects
```

기대 출력: `index.html`, `assets/`, `_redirects`, `manifest.json`, `robots.txt` 존재. `_redirects` 내용은 `/*    /index.html   200`. `_redirects`가 없으면 배포 후 SPA 라우팅(`/login` 직접 진입)이 404가 되므로 반드시 확인할 것.

- [ ] **Step 3: 빌드된 `index.html`이 CRA 잔재 없이 생성됐는지 확인**

```bash
grep -c "PUBLIC_URL" build/index.html; echo "exit=$?"
```

기대 출력: `0`과 `exit=1`. `%PUBLIC_URL%`이 남아 있으면 Task 3 Step 3이 누락됐거나 `public/index.html`이 삭제되지 않아 산출물을 덮어쓴 것이다.

- [ ] **Step 4: 프로덕션 번들에 환경변수가 주입됐는지 확인**

```bash
grep -ro "appkey=[^&\"]*" build/assets | head -3
```

기대 출력: `appkey=` 뒤에 실제 키 문자열. `appkey=undefined` 또는 `appkey=` + `process.env`가 보이면 Task 4 Step 4의 대응을 적용할 것.

- [ ] **Step 5: preview로 프로덕션 번들 동작 확인**

```bash
npm run preview
```

Browser 도구로 안내된 URL에 접속해 Task 4의 Step 3·5·6을 반복한다.

기대 결과: 콘솔 에러 0건, 지도·검색·스타일 정상. dev에서는 되지만 preview에서 깨지면 CJS 의존성(`react-helmet`, `qs`) interop 문제일 가능성이 높다 — 그 경우 `vite.config.ts`에 `optimizeDeps: { include: ['react-helmet', 'qs'] }`를 추가하고 재빌드해 확인한 뒤, 추가했다면 커밋한다.

- [ ] **Step 6: 빌드 산출물이 추적되지 않음을 확인**

```bash
git status --short
```

기대 출력: `build/`가 나타나지 않음(`.gitignore`의 `/build` 적용). Step 5에서 `vite.config.ts`를 수정했다면 그 변경만 커밋한다.

---

### Task 6: 문서 갱신과 최종 스윕

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-09-02-vite-migration-design.md` (Task 4·5에서 설정을 변경한 경우에만)

**Interfaces:**
- Consumes: Task 1~5의 최종 상태

- [ ] **Step 1: `README.md`의 기술 스택 문구 수정**

`### 기술 스택` 절의 Frontend 줄에서 CRA 표기를 Vite로 바꾼다.

변경 전:
```markdown
- **Frontend**: React 18, TypeScript, CRA + CRACO, MUI v6, SCSS
```

변경 후:
```markdown
- **Frontend**: React 18, TypeScript, Vite 6, MUI v6, SCSS
```

- [ ] **Step 2: `README.md`의 환경변수 설명 문구 수정**

환경변수 **이름은 바뀌지 않았으므로** `.env` 예시 코드 블록은 그대로 두고, CRA 규칙을 설명하는 앞 문장만 바꾼다.

변경 전:
```markdown
CRA는 `REACT_APP_` 접두사가 있는 변수만 클라이언트로 주입됩니다. 프로젝트 루트에 `.env` 파일을 만들고 아래 값을 설정하세요.
```

변경 후:
```markdown
`REACT_APP_` 접두사가 있는 변수만 클라이언트로 주입됩니다(`vite.config.ts`의 `envPrefix` 설정). 프로젝트 루트에 `.env` 파일을 만들고 아래 값을 설정하세요.
```

- [ ] **Step 3: `README.md`의 실행 스크립트 목록 수정**

테스트 스크립트를 제거하고 preview를 추가한다.

변경 전:
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

변경 후:
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm start

# 프로덕션 빌드
npm run build

# 프로덕션 번들 로컬 확인
npm run preview
```

- [ ] **Step 4: CRA 잔재 전수 확인**

```bash
grep -rn "react-scripts\|craco\|CRACO\|PUBLIC_URL\|node-sass" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=docs --exclude-dir=.claude --exclude=package-lock.json
```

기대 출력: 매칭 없음. `docs/`는 설계 문서가 CRA를 배경으로 언급하므로 제외한다. `package-lock.json`은 전이 의존성 이름에 걸릴 수 있어 제외한다.

- [ ] **Step 5: Task 4·5에서 설정을 변경했다면 스펙에 반영**

Task 4 Step 4에서 `'process.env': '({})'`를 제거했거나 Task 5 Step 5에서 `optimizeDeps`를 추가했다면, 스펙 §4.2와 §9의 해당 서술을 실제 최종 설정과 일치하도록 수정한다. 변경이 없었다면 이 단계는 건너뛴다.

- [ ] **Step 6: 최종 빌드 재확인**

```bash
npm run build && ls build/index.html build/_redirects
```

기대 출력: 빌드 성공, 두 파일 모두 존재.

- [ ] **Step 7: 커밋**

```bash
git add README.md
git commit -m "docs: README를 Vite 기준으로 갱신

기술 스택 표기, 환경변수 주입 규칙 설명(envPrefix), 실행 스크립트
목록을 수정했다. 환경변수 이름은 REACT_APP_ 그대로이므로 .env 예시는
변경하지 않았다."
```

---

## 완료 조건

아래가 모두 참이면 마이그레이션 완료다.

1. `npm start`가 `http://localhost:3000`에서 기동하고 브라우저 콘솔 에러가 0건
2. 지도 렌더·마커 표시, 툴바 검색 자동완성, 캘린더 렌더가 동작
3. `_variables.scss`/`_mixins.scss`를 쓰는 화면의 스타일이 정상 적용
4. `npm run build`가 `build/`에 산출물을 만들고 `_redirects`를 포함
5. `npm run preview`에서 1~3이 동일하게 동작
6. 프로덕션 번들에 환경변수 6개가 실제 값으로 주입
7. 저장소에 `react-scripts`·`craco`·`node-sass`·`%PUBLIC_URL%` 잔재가 없음
8. `src/**`의 TS/TSX 파일과 `tsconfig.json`·`tsconfig.paths.json`이 무수정
