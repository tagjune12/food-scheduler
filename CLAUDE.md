# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

머먹지 ("meomeokji") is a React + TypeScript web app for tracking restaurant visits and planning future ones. Users explore restaurants on a Kakao Maps view, manage visit schedules through Google Calendar, and store bookmarks/visit history in Supabase.

## Code conventions

See [docs/CODE_CONVENTIONS.md](docs/CODE_CONVENTIONS.md) for the React/TypeScript conventions used in this repo (directory structure, Container/Presentational pattern, Context+useReducer state pattern, typing rules, naming, import order). Follow it when writing or reviewing code here.

## Commands

```bash
npm install       # install dependencies
npm start         # dev server (craco start)
npm test          # test runner (craco test)
npm run build     # production build (craco build)
```

There is no lint script; ESLint config is inherited from `react-app`/`react-app/jest` via CRA. There are no test files in the repo currently, so `npm test` will report no tests found.

Node version is pinned via Volta to `18.19.1` (see `package.json`).

### Environment variables

CRA only injects vars prefixed `REACT_APP_`. Required in a root `.env` (see [README.md](README.md) for full details):

- `REACT_APP_GOOGLECALENDAR_CLIENT_ID`, `REACT_APP_GOOGLE_LOGIN_REDIRECT_URL` — Google OAuth/Calendar
- `REACT_APP_KAKAO_MAP_API_JS_KEY`, `REACT_APP_KAKAO_MAP_API_REST_KEY` — Kakao Maps
- `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY` — Supabase

## Build tooling and path aliases

The project uses CRA + CRACO (`craco.config.js`) with `craco-alias`/`react-app-alias` to resolve TypeScript path aliases defined in [tsconfig.paths.json](tsconfig.paths.json):

- `@src/*` → `src/*`
- `@components/*` → `src/components/*`
- `@lib/*` → `src/lib/*`
- `@pages/*` → `src/pages/*`
- `@data/*`, `@containers/*`, `@assets/*`, `@styles/*` are also declared (some directories may not exist yet)

Always use these aliases instead of relative `../../..` imports when adding new code in `src/`.

## Architecture

### Container / Presentational split

Feature components are split into a stateful Container and a "dumb" Presentational component. When modifying behavior, edit the Container; when modifying markup/styling, edit the Presentational component.

| Container | Presentational | Responsibility |
|---|---|---|
| `MapContainer` (`src/components/Map/`) | `Map` | Kakao map init, markers, clustering, custom overlays, place filter (all/restaurant/cafe) |
| `MainToolbarContainer` (`src/components/commons/maintoolbar/`) | `MainToolbar` | Search + `#tag` search, login/logout state |
| `CalendarContainer` (`src/components/calendar/`) | `Calendar` | Google Calendar CRUD wired into FullCalendar |
| `MobileCalendarContainer` | `MobileCalendar` | Mobile calendar layout |
| `RestaurantListContainer` | `RestaurantList` | Restaurant list shown alongside the calendar |

### App bootstrap and auth flow (`src/App.tsx`)

- Google OAuth 2.0 uses the **implicit flow**: on redirect back to the app, the `access_token` arrives in the URL hash. `App.tsx` parses it with `qs`, strips the hash via `history.replaceState`, and persists it through [`saveToken`/`getStoredToken`/`isTokenValid`](src/lib/util.ts) in `localStorage` (with an expiry timestamp).
- The module-level `export let access_token` in `App.tsx` is read directly by API modules (e.g. [`calendar_api.ts`](src/lib/api/calendar_api.ts) imports `access_token` from `@src/App`) instead of being threaded through props/context — keep this in mind when tracing how the calendar API authenticates.
- A separate internal user id (derived from the Google email local-part via [`getUserInfo`](src/lib/api/user_api.ts)) is cached in `localStorage` and used as the `user_id` key for all Supabase reads/writes (bookmarks, history, per-user calendar selection).
- Routes (`react-router-dom` v6): `/` (main app, browsable without login), `/login`, `/privacy`. Map exploration works logged-out; calendar/bookmark features prompt a login redirect.

### State management: layered React Context

Contexts are composed in `App.tsx`'s `AuthenticatedApp`, from outermost to innermost: `MapInitProvider` (wraps `<App/>` in `index.tsx`) → `AuthProvider` → `BookmarkProvider` (needs `userId`) → `TodayRestaurantProvider` (needs `userId`) → `ModalProvider`. Each context module (`src/context/*.tsx`) exports paired `useXState`/`useXActions` (or `useXDispatch`) hooks that throw if used outside their provider — follow that pattern for new contexts rather than exporting the raw context.

### Data layer (`src/lib/api/`)

- `supabase_api.ts` — all Supabase reads/writes. Restaurant data lives in the `places` table (`category_group_code`: `FD6` = restaurant, `CE7` = cafe); bookmarks/history are joined server-side via Postgres views/RPCs (`call_bookmarks_with_places`, `call_places_with_history`, `get_places_with_bookmarks`, `get_places_with_name_and_bookmarks`) rather than joined client-side. When adding a new filtered/joined query, prefer adding a view or RPC in Supabase over composing multiple client-side queries.
- `calendar_api.ts` — thin wrapper over the raw Google Calendar REST API (`fetch`, not `googleapis`), keyed off `access_token` from `App.tsx`. Event start/end dates are all-day (`{ date: 'YYYY-MM-DD' }`); insert/update compute the end date as start+1 day with manual month/year rollover.
- `kakao_api.ts` / `user_api.ts` — Kakao Places search and Google `userinfo` lookup respectively.
- `src/types/supabase.ts` is the generated Supabase `Database` type (tables/views/RPC signatures); domain types in [`src/types/index.d.ts`](src/types/index.d.ts) (`PlaceRow`, `PlaceWithBookmark`, etc.) are derived from it via `Database['public'][...]`. Regenerate this file with the Supabase CLI after schema changes rather than hand-editing it. Note: the root-level `database.types.ts` is an empty stub — the real generated types are `src/types/supabase.ts`.

### Kakao Maps integration (`MapContainer`)

The Kakao Maps SDK is loaded imperatively via a `<script>` tag injected in a `useEffect` (guarded by `#kakao-map-script` id / `window.kakao`), not through a React wrapper library. Markers, the marker clusterer, and custom overlays are all managed through refs (`mapRef`, `markersRef`, `markerClustererRef`, `currentOverlayRef`) and imperative Kakao SDK calls; overlay content is a detached DOM node into which a React root is mounted with `createRoot` (e.g. `MapCard`) — this bridges Kakao's non-React overlay API with React components. Global custom events (e.g. `openPlaceFromSearch`) are used to communicate from the search toolbar into the map container across the component tree.

### Supabase project config

`supabase/config.toml` configures the local Supabase CLI stack (API port 54321, DB port 54322, etc.) for local development against the schema described above; there are no checked-in SQL migration files in this repo.
