# VoxTrail – Testing Quickstart

Keep it simple: one section for backend (Jest) and one for frontend (Vitest). Both run offline with mocks.

## Backend (`travel-app-be`)
- Install & run: `cd travel-app-be && npm install && npm test` (uses `tests/setupEnv.js` for Firebase/Places/OpenRouter stubs).
- Common targets: `npx jest tests/translationRoutes.test.js --runInBand`, `npx jest rateLimiter --runInBand`.
- Auth tokens in tests: `valid-user-token` (user) and `valid-admin-token` (admin). Signed routes accept these without request signatures.
- Patterns to copy:
  - Happy + guard cases per route (auth, schema, rate limit).
  - Mock external calls; never hit real APIs. Extend stubs in `tests/setupEnv.js` if needed.
  - Expect structured errors (`error.code`, `message`) from `src/utils/errorHandler.js`.

## Frontend (`travel-app-fe`)
- Install & run: `cd travel-app-fe && npm install && npm run test` (Vitest + jsdom; `src/test/setupTests.js` silences logs and stubs `matchMedia`).
- Run one file: `npx vitest run src/components/pages/__tests__/Emergency.test.jsx --runInBand`.
- Testing patterns:
  - Services: mock `api` or firebase modules with `vi.fn()`.
  - Components/Hooks: render with Testing Library, wrap in needed providers (`MemoryRouter`, Redux `Provider`, context providers).
  - Use `screen.getBy...` selectors that match real labels/placeholders; prefer role+name for buttons.
  - For timers (Forgot/Reset password flows), keep `vi.useFakeTimers()` + `await vi.runAllTimersAsync()` inside `act`.

## CI hints
- Backend job: `cd travel-app-be && npm ci && npm test`.
- Frontend job: `cd travel-app-fe && npm ci && npm run test -- --runInBand`.
- No real credentials required; mocks cover Firebase/Places/transformers/OpenRouter.

## Quick troubleshooting
- “matchMedia is not a function”: ensured in `src/test/setupTests.js`; keep it if adding more env stubs.
- “could not find react-redux context value”: wrap renders in a Redux `Provider` with the appropriate slice reducers.
- “Multiple elements found”: switch to `getAllBy...` or use more specific matchers (placeholder text, role+name).
- Timeouts in async UI tests: flush fake timers, then `waitFor` with a reasonable timeout.
