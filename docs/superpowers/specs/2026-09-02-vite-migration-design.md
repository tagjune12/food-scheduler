# CRA(craco) → Vite 마이그레이션 설계

작성일: 2026-09-02
대상 브랜치: `claude/simplify-import-statements-42ad7b`

## 1. 배경

`@components/...` 형태의 별칭 import를 쓰기 위해 craco + react-app-alias를 도입한 상태다. CRA(react-scripts)는 webpack 설정을 감추기 때문에 `tsconfig`의 `paths`가 타입 체크에만 적용되고 번들러는 별칭을 알지 못한다. craco는 이 제약을 우회하기 위한 래퍼일 뿐이며, react-scripts 자체도 유지보수가 종료된 상태다.

Vite는 `resolve.alias`를 네이티브로 제공하므로 래퍼 도구가 필요하지 않다. 즉 이 마이그레이션의 목적은 **별칭 import를 그대로 유지하면서 craco와 react-scripts 의존을 제거**하는 것이다.

## 2. 확정된 결정

| 항목 | 결정 | 근거 |
|---|---|---|
| 번들러 | Vite 6 | volta 핀(Node 18.19.1) 유지가 요구사항. Vite 7은 Node 20.19+ 필요 |
| Node | `18.19.1` 핀 유지 | 배포처·CI의 Node 버전을 건드리지 않는다 |
| 환경변수 | `REACT_APP_` 접두사 유지 | 소스 6곳, 로컬 `.env`, 배포 환경변수를 모두 무수정으로 둔다 |
| 별칭 단일 출처 | `tsconfig.paths.json` | 별칭 추가 시 한 파일만 고치는 현재 DX를 보존 (craco-alias의 `source: "tsconfig"`와 동일) |
| 별칭 전달 방식 | `vite.config.ts`가 `tsconfig.paths.json`을 읽어 `resolve.alias` 생성 | 플러그인 의존 없이 단일 출처를 유지하며, SCSS에도 적용되는 유일한 방식이다 (§4.1) |
| SCSS import | 별칭 → 상대경로 선제 전환 | Vite의 sass 별칭 해석에 대한 의존을 제거해 위험을 없앤다 (§5) |
| 범위 | 최소 교체 + SCSS 경로 전환 | 그 외 정리 작업은 동시에 하지 않는다 (§3) |

## 3. 비목표

아래는 이번 작업에서 **하지 않는다**. 빌드 도구 교체와 무관한 변경이 섞이면 문제 발생 시 원인 구분이 불가능해지기 때문이다.

- SCSS `@import` → `@use` 모듈 전환 (변수 네임스페이스가 바뀌는 별개의 스타일 리팩터링)
- 미사용 별칭(`@data`, `@assets`, `@styles`, `@containers`) 제거
- vitest·standalone eslint 인프라 구축 (현재 테스트 파일 0개)
- 불필요 의존성(`i`, `@types/navermaps`) 정리
- TypeScript·React·MUI 등 런타임 의존성 버전 업그레이드

## 4. 설계

### 4.1 별칭 전달: `vite-tsconfig-paths`를 쓰지 않는 이유

Vite는 SCSS 등 전처리기 내부의 `@import` 경로를 해석할 때 `resolve.alias`에서 만든 내부 리졸버만 사용하고, 사용자 플러그인의 `resolveId` 훅은 타지 않는다. 따라서 `vite-tsconfig-paths`를 쓰면 TS/TSX의 별칭은 해석되지만 SCSS의 별칭 import는 해석되지 않는다.

이번 설계는 SCSS를 상대경로로 전환하므로(§5) SCSS 쪽 요구는 사라지지만, 별칭 정의를 `tsconfig.paths.json` 한 곳에 유지하기 위해 `vite.config.ts`가 그 파일을 직접 읽어 `resolve.alias`를 생성한다.

### 4.2 `vite.config.ts`

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
      'process.env': 'import.meta.env',
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

항목별 근거:

- **`alias`** — `tsconfig.paths.json`의 `"@components/*": ["src/components/*"]`를 `{ find: '@components', replacement: <절대경로>/src/components }`로 변환한다. Vite의 문자열 `find`는 import id가 정확히 일치하거나 `find + '/'`로 시작할 때만 매칭되므로 부분 문자열 오탐이 없다. `__dirname` 사용이 가능한 이유는 `package.json`에 `"type": "module"`이 없어 Vite가 설정 파일을 CJS로 번들하기 때문이다. 향후 ESM으로 전환한다면 `fileURLToPath(import.meta.url)`로 바꿔야 한다.
- **`define`** — `loadEnv`로 읽은 `REACT_APP_*` 값을 `process.env.REACT_APP_X` 리터럴 치환으로 주입한다. 소스 6곳을 수정하지 않기 위한 장치다. `'process.env': 'import.meta.env'`를 쓰는 이유는, esbuild의 프로덕션 빌드 경로에서 `define` 값 검증이 엔티티 경로(참조)나 JS 리터럴(문자열/숫자/불리언/null/undefined)만 허용하고 `({})`/`{}` 같은 객체 리터럴 표현식은 거부하기 때문이다(`npm run build`가 바로 이 줄에서 실패하며 발견됨). `import.meta.env`는 유효한 엔티티 경로이고, 같은 설정의 `envPrefix: 'REACT_APP_'` 덕분에 Vite 자체의 네이티브 `import.meta.env` 객체는 dev·build 모두에서 이미 모든 `REACT_APP_*` 변수로 채워져 있다. 따라서 위의 키별 `define`에 걸리지 않는(`.env`에 없는 키에 대한) `process.env.SOMETHING` 참조는 `import.meta.env.SOMETHING`로 안전하게 폴스루되어, 문법적으로 유효하면서도 동일한 안전성 목표를 달성한다.
- **dev 모드에서의 동작 방식** — dev serve 모드에서는 Vite의 `vite:define` 플러그인이 클라이언트 환경에 대해 텍스트 치환 자체를 건너뛴다(`transform` 훅이 `consumer === "client" && !isBuild`일 때 조기 반환). 즉 위의 키별 `process.env.REACT_APP_X` define은 dev로 서빙되는 소스에 텍스트로 치환되지 않는다(실제로 dev 서버가 서빙하는 원본 파일에는 치환되지 않은 `process.env.REACT_APP_X` 표현식이 그대로 남아있음을 확인했다). 그런데도 dev에서 앱은 정상 동작한다 — `vite.config.ts`의 `define` 설정을 통째로 제거하면 `window.process`가 `undefined`가 되고 복원하면 다시 채워지는 것을 직접 실험(on/off 토글 테스트)으로 확인했으므로, dev 모드의 이 동작이 `define` 설정에 인과적으로 의존하는 것은 확실하다. 다만 Vite/esbuild 내부의 정확히 어떤 코드 경로가 이 런타임 `process` 전역 객체를 구성하는지는 추적하지 못했다 — 의존성 프리번들링(esbuild 사전 번들러)이 관련되어 있을 것이라는 추정은 있으나 확정된 근거는 없다(설치된 `vite` 패키지 소스를 직접 조사했을 때, 의존성 번들링 경로가 넘기는 `define`은 `process.env.NODE_ENV` 단일 키뿐이었고 우리의 `REACT_APP_*` 키들을 채운 객체를 구성하는 코드는 발견하지 못했다). 프로덕션 빌드(`isBuild`가 true이므로 client/dev 스킵의 영향을 받지 않아 실제 텍스트 치환이 일어난다)는 이 미확인 dev 전용 메커니즘에 의존하지 않으므로, 이 불확실성은 배포 산출물에 영향이 없다.
- **`envPrefix`** — 앞으로 추가되는 코드가 `import.meta.env.REACT_APP_*`로도 접근할 수 있게 한다. 기존 소스 동작에는 영향이 없다.
- **`server.port` / `strictPort`** — Kakao Developers 도메인 허용목록과 Google OAuth 리디렉트 URI가 `http://localhost:3000`에 등록되어 있다. `strictPort`가 없으면 3000 점유 시 조용히 다른 포트로 옮겨가 OAuth와 지도 SDK가 실패한다.
- **`build.outDir`** — 배포처의 publish 디렉터리 설정을 그대로 사용하기 위해 Vite 기본값 `dist` 대신 `build`를 쓴다. `.gitignore`는 이미 `/build`와 `/dist`를 모두 무시한다.
- **`css.preprocessorOptions.scss.silenceDeprecations`** — dart-sass 1.80+ 는 `@import`에 deprecation 경고를 낸다. `@use` 전환은 비목표이므로 경고만 억제한다.

### 4.3 `index.html`

`public/index.html`을 저장소 루트로 옮기고 두 가지를 수정한다.

- `%PUBLIC_URL%/` → `/` (favicon.ico, logo192.png, manifest.json 3곳)
- `</body>` 직전에 `<script type="module" src="/src/index.tsx"></script>` 추가

`public/`의 나머지 파일(`_redirects`, `manifest.json`, `robots.txt`)은 Vite가 빌드 시 `outDir`로 그대로 복사하므로 SPA 리다이렉트 설정이 유지된다.

### 4.4 타입 선언

`src/react-app-env.d.ts`(`/// <reference types="react-scripts" />`)를 삭제하고 `src/vite-env.d.ts`에 `/// <reference types="vite/client" />`를 둔다. `tsconfig.json`은 수정하지 않는다 — `isolatedModules: true`가 이미 설정되어 Vite와 호환되고, `moduleResolution: "node"`는 TypeScript 4.9.5에서 `vite/client` 타입을 정상 해석한다.

### 4.5 타입 체크 시점

CRA는 dev 서버 실행 중 타입 에러를 화면에 표시했지만 Vite는 하지 않는다. `build` 스크립트를 `tsc && vite build`로 두어 빌드 시 타입 검증을 보장하고, 개발 중 타입 체크는 에디터에 의존한다. `vite-plugin-checker` 도입은 필요해질 때 별도로 판단한다.

## 5. SCSS 경로 전환

`_variables.scss`와 `_mixins.scss`는 `src/components/commons/`에 있다. 6개 파일 12줄을 상대경로로 바꾼다.

| 파일 | 변경 전 | 변경 후 |
|---|---|---|
| `src/components/commons/Mapcard.scss` | `@components/commons/variables`, `@components/commons/mixins` | `./variables`, `./mixins` |
| `src/components/commons/Modal.scss` | `@components/commons/variables`, `// @components/commons/mixins` | `./variables`, `// ./mixins` |
| `src/components/commons/RestaurantCard.scss` | `@components/commons/variables`, `@components/commons/mixins` | `./variables`, `./mixins` |
| `src/components/sidebar/History.scss` | `@components/commons/variables`, `@components/commons/mixins` | `../commons/variables`, `../commons/mixins` |
| `src/components/sidebar/SideBar.scss` | `@components/commons/variables`, `@components/commons/mixins` | `../commons/variables`, `../commons/mixins` |
| `src/components/sidebar/TodayRestaurant.scss` | `@components/commons/variables`, `@components/commons/mixins` | `../commons/variables`, `../commons/mixins` |

`Modal.scss`의 주석 처리된 import도 함께 갱신해, 나중에 주석을 해제했을 때 곧바로 동작하도록 한다.

TSX에서 SCSS 파일을 별칭으로 import하는 구문(`import '@components/sidebar/SideBar.scss'` 등)은 **수정하지 않는다**. 이것은 JS 모듈 그래프의 import이므로 Vite 코어 리졸버가 `resolve.alias`로 처리한다. 전환 대상은 SCSS 파일 내부의 sass `@import`뿐이다.

## 6. `package.json`

**제거 (dependencies)**: `react-scripts`, `craco`
**제거 (devDependencies)**: `@craco/craco`, `@craco/types`, `craco-alias`, `react-app-alias`, `node-sass`
**추가 (devDependencies)**: `vite@^6`, `@vitejs/plugin-react@^4`, `sass@^1`

`node-sass`는 Vite에서 지원되지 않으므로 dart-sass(`sass`)로 교체한다.

**스크립트**

```json
{
  "start": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview"
}
```

`test`는 테스트 파일이 0개이므로 제거하고, `eject`는 react-scripts 전용이므로 제거한다. `eslintConfig` 블록도 제거한다 — `react-app` 프리셋은 react-scripts가 제공하던 것이고, 별도 lint 스크립트가 없어 깨지는 동작이 없다. 이로써 CRA가 빌드 시 수행했던 lint 경고는 사라진다.

`volta.node`는 `18.19.1`을 유지한다.

## 7. 파일 변경 요약

| 구분 | 대상 |
|---|---|
| 신규 | `vite.config.ts`, `index.html`(루트), `src/vite-env.d.ts` |
| 삭제 | `craco.config.js`, `public/index.html`, `src/react-app-env.d.ts` |
| 수정 | `package.json`, SCSS 6개 파일(§5), `README.md` |
| 무수정 | `tsconfig.json`, `tsconfig.paths.json`, `src/**` 의 모든 TS/TSX, `public/_redirects`, `public/manifest.json`, `public/robots.txt`, `.gitignore` |

`README.md`는 기술 스택 표기("CRA + CRACO" → "Vite"), 환경변수 설명 문구(CRA의 `REACT_APP_` 규칙 → Vite `envPrefix` 설정), 실행 스크립트 목록(`npm test` 제거)을 수정한다. 환경변수 **이름**은 바뀌지 않으므로 `.env` 예시 블록은 그대로 둔다.

## 8. 검증 계획

| 단계 | 명령/행위 | 성공 기준 |
|---|---|---|
| 1 | `npm install` | craco·react-scripts 제거 상태로 설치 완료 |
| 2 | `npx tsc --noEmit` | 타입 에러 0 (기존 에러가 있으면 마이그레이션과 분리해 보고) |
| 3 | `npm start` | `localhost:3000` 기동, 브라우저 콘솔 에러 0 |
| 4 | 브라우저 확인 | 지도 렌더·마커 표시, 툴바 검색 동작, 캘린더 렌더 |
| 5 | SCSS 확인 | 변수·믹스인을 쓰는 사이드바·카드·모달의 스타일이 정상 적용 |
| 6 | `npm run build` | `build/` 생성, 내부에 `_redirects` 포함 |
| 7 | `npm run preview` | 프로덕션 번들에서 3·4·5와 동일하게 동작 |
| 8 | 환경변수 확인 | Kakao SDK 로드 성공, Supabase 요청 200 (6개 변수 주입 검증) |

브라우저 확인은 Browser 도구로 직접 수행한다.

## 9. 남은 위험

- **CJS 의존성 interop** — `react-helmet`, `qs`가 CJS 패키지다. Vite의 의존성 사전 번들링으로 처리되는 것이 정상이지만, 실패 시 `optimizeDeps.include`에 명시적으로 추가한다.
- **`process.env` 치환 누락** — `define`은 리터럴 멤버 접근만 치환한다. 현재 6곳 모두 `process.env.REACT_APP_X` 형태의 직접 접근임을 확인했으므로 해당 없으나, 향후 동적 접근(`process.env[key]`)을 추가하면 동작하지 않는다.
- **dev 중 타입 체크 부재 / 빌드 시 lint 부재** — §4.5, §6에 기술. 후속 작업으로 분리.
- **esbuild define 값 검증** — production build 시 esbuild는 `define`의 값으로 엔티티 경로(참조)나 JS 리터럴(문자열/숫자/불리언/null/undefined)만 허용하고, `({})`/`{}` 같은 객체 리터럴 표현식은 거부한다(`Invalid define value (must be an entity name or JS literal)`). `process.env`의 폴백 값은 반드시 `import.meta.env`처럼 유효한 참조 경로여야 한다 — 이 값을 바꿀 때는 반드시 `npm run build`로 재검증할 것.
- **dev 모드의 드문 재연결 레이스** — Vite dev 서버가 HMR 연결을 재시작하는 순간(의존성 재탐색으로 인한 캐시 초기화 직후, 또는 세션이 길어지며 자연히 발생하는 재연결 등)과 맞물리면 모듈 최상위 레벨의 `process.env.X` 접근이 `ReferenceError: process is not defined`를 드물게 던질 수 있다. 서버를 막 띄우고 즉시 한 번 확인하는 정도로는 거의 재현되지 않지만, 상호작용이 길어지는 실제 개발 세션에서는 반복적으로 관찰될 수 있다. 프로덕션 빌드는 리터럴 치환이라 이 레이스의 영향을 받지 않는다. 재현 시 페이지를 새로고침하면 해결된다 — 근본 수정(예: 모듈 최상위 대신 지연 초기화)은 앱 코드 변경이라 이번 마이그레이션 범위 밖으로 둔다.

## 10. 롤백

모든 변경은 브랜치 `claude/simplify-import-statements-42ad7b`의 커밋으로 이루어진다. 문제 발생 시 브랜치를 폐기하면 `main`의 CRA 구성이 그대로 남는다.
