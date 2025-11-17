# Smart Travel Companion – Testing Step‑By‑Step Guide

This playbook walks you through implementing and using the automated tests that now ship with the project. It covers both apps:

| Surface | Location | Stack | Primary Coverage |
| --- | --- | --- | --- |
| Backend API | `travel-app-be` | Jest + Supertest | Request signing, auth guards, schema validation, external API fallbacks |
| Frontend | `travel-app-fe` | Vitest + Testing Library | Auth services, feature-flag context, UI hooks/components |

---

## 1. Backend (Jest + Supertest)

### Step 1 – Install & bootstrap
```bash
cd travel-app-be
npm install
```
> `jest.config.js` is already wired to look inside `tests/**/*.test.js` and to load `tests/setupEnv.js` before every run. The setup file injects fake Firebase credentials, mocks `firebase-admin`, and stubs Google Places helpers so tests run offline.

### Step 2 – Run the whole suite
```bash
npm test
```
This executes Jest in `--runInBand` mode so Supertest can spin up a single Express instance (`createApp()`). You should see the security/integration specs from `tests/security.test.js` pass in ~2–3 s on a laptop.

### Step 3 – Target individual specs
Use Jest’s filtering flags when iterating quickly:
```bash
npx jest tests/security.test.js
npx jest security --runInBand --watch
```
Add `--detectOpenHandles` if you introduce custom async resources and need to verify cleanup.

### Step 4 – Add new tests
1. **Mirror the existing pattern**: import `createApp`, spin up Supertest requests, and assert both status codes and structured error payloads (look at `ERROR_CODES` in `src/utils/errorHandler.js`).
2. **Mock external services**: extend the stubs in `tests/setupEnv.js` (e.g., add a `mockItineraryCollection`) or create one-off `jest.mock()` blocks inside your new test file. Never hit real Firebase/OpenRouter/Google endpoints.
3. **Exercise validation**: when you add a new route, include two tests—happy path (authorized + valid payload) and guard path (missing auth, invalid schema, or rate limit). The existing suite has examples for `/api/stays/search`, `/api/users`, and `/api/itinerary/generate`.
4. **Keep tests deterministic**: leverage fixed timestamps/uuids. Jest is configured for Node environment, so you can stub `Date.now()` when needed.

### Step 5 – Troubleshooting
- **“Missing request signature” errors**: tests that hit signed endpoints must either attach `Authorization: Bearer valid-user-token` (which bypasses signing inside the middleware) or manually send `x-request-signature` + `x-timestamp`.
- **Auth role checks**: the mocked Firebase admin returns two known tokens:
  - `valid-user-token` → regular user
  - `valid-admin-token` → admin
- **Firestore mocks**: `tests/setupEnv.js` exposes chained `collection().doc()` mocks. If you need more complex behavior, extend the returned objects there so every test benefits.

---

## 2. Frontend (Vitest + Testing Library)

### Step 1 – Install & bootstrap
```bash
cd travel-app-fe
npm install
```
`vite.config.js` already enables Vitest with `jsdom`, and `src/test/setupTests.js` pulls in the Testing Library matchers globally.

### Step 2 – Run the suite
```bash
npm run test
```
Vitest runs in watch mode by default. Press `q` to quit, `p` to filter by file name, or `t` to filter by test name.

### Step 3 – Add new UI/service tests
1. **Placement**: store specs next to their subjects (e.g., `contexts/__tests__/featureFlags.test.jsx`, `services/__tests__/auth.test.js`). Vitest picks up any `*.test.(js|jsx|ts|tsx)` by default.
2. **Mock Firebase**: follow the pattern in `src/services/__tests__/auth.test.js`—mock `firebase/auth` functions with `vi.fn()` and stub `auth.currentUser` exported from `src/firebase.js`.
3. **Test feature gates**: `FeatureFlagsContext` wiring is demonstrated in `featureFlags.test.jsx`. Wrap your component with `<FeatureFlagsProvider>` and use `render()` from Testing Library to assert toggled flags or conditional UI.
4. **Use hooks safely**: for hooks like `useAuth`, create a harness component that renders children inside `AuthProvider`, then assert DOM updates.

### Step 4 – Useful Vitest flags
```bash
npm run test -- --runInBand             # serialize when debugging flaky specs
npm run test -- FeatureFlags            # only run files matching “FeatureFlags”
npm run test -- -u                      # update snapshots if you add them later
```

---

## 3. Continuous Integration Checklist

1. **Backend job**
   ```yaml
   - name: Backend tests
     working-directory: travel-app-be
     run: npm ci && npm test
   ```
   Environment variables are not required because the Jest setup mocks Firebase/Google. Ensure `NODE_ENV=test` is set (the npm script already does this).

2. **Frontend job**
   ```yaml
   - name: Frontend tests
     working-directory: travel-app-fe
     run: npm ci && npm run test -- --runInBand
   ```
   Vitest works without Firebase credentials since all auth calls are mocked.

3. **Pre-merge gate**: block merges unless both jobs pass. Optionally add coverage thresholds later (`--coverage` for Jest, `--coverage` flag in Vitest).

---

## 4. When implementing new features…

- **Start with tests**: define the desired API/UX behavior in Jest/Vitest before wiring controllers or components.
- **Stay consistent**: keep backend specs under `tests/` and frontend specs next to their modules to avoid orphaned files.
- **Document edge cases**: if you discover quirks (e.g., Google Places throttling), encode them as tests so regressions surface immediately.

Following this guide ensures anyone on the team can reproduce the test setup locally, extend coverage, and wire it into CI without hunting through config files.
