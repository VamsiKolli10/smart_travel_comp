# Smart Travel Companion

An AI-assisted travel assistant that combines realtime translation, curated phrasebooks, cultural guidance, safety tooling, and accommodation discovery. This repository hosts both the React front-end (`travel-app-fe`) and the Node/Express backend (`travel-app-be`).

---

## Repository Layout

```
smart_travel_comp/
├── travel-app-fe/   # Vite + React + MUI front-end
├── travel-app-be/   # Express API (Firebase Auth, OpenRouter, Google Places)
└── LICENSE
```

---

## Feature Highlights

- **Authentication** – Firebase email/password with Google sign-in, protected routes, theme-aware UI shell.
- **Translation workspace** – Two-pane translator backed by `@xenova/transformers` models running on the API.
- **AI Phrasebooks** – Topic-based phrase suggestions generated via OpenRouter LLMs with the ability to save favorites.
- **Saved phrases** – User-scoped Firestore collections persisted via secure backend routes.
- **Stays search** – Google Places powered lodging search with filtering, amenity tags, details pages, and photo proxying.
- **Destinations & POIs** – Discover points of interest with rich cards, details pages, etiquette guidance, and map/context sharing.
- **Itinerary planner (beta)** – Natural-language and form-based trip planner on the Discover page that uses the backend itinerary API and fully aligns with the MUI design system.
- **Cultural intelligence & etiquette** – Country/destination-specific guidance surfaced contextually in destination details.
- **Emergency utilities** – Quick access to structured emergency contacts and guidance.

---

## Technology Stack

| Layer      | Technologies                                                                                          |
|------------|-------------------------------------------------------------------------------------------------------|
| Front-end  | Vite, React 18, React Router 6, Redux Toolkit, MUI, Tailwind (utility classes), MapLibre GL (maps)    |
| Back-end   | Node.js 20+, Express 5, Firebase Admin SDK, Axios, OpenRouter API, Google Places API, express-rate-limit |
| Data/Auth  | Firebase Authentication, Firestore (per-user saved data)                                              |
| Infra      | Firebase service account for admin access, optional Firebase Functions scaffold                      |

---

## Environment Configuration

1. **Firebase**
   - Create a Firebase project.
   - Enable Email/Password and Google OAuth providers.
   - Generate a Web App (copy the config for the front-end) and a service account (JSON) for the backend.
2. **OpenRouter**
   - Create an API key and optionally pick a default model (e.g., `gpt-4o-mini`).
3. **Google Places API**
   - Enable the Places API (new) and Maps Places API (legacy photo endpoint) and create an API key.

Copy the provided `.env.example` files and fill them with your secrets:

```bash
cp travel-app-be/.env.example travel-app-be/.env
cp travel-app-fe/.env.example travel-app-fe/.env
```

| Variable (backend)           | Purpose                                              |
|-----------------------------|------------------------------------------------------|
| `APP_PORT`                  | Express port for local dev (default `8000`)          |
| `FB_ADMIN_CREDENTIALS`| **Required.** Base64-encoded Firebase service-account JSON injected via your secrets manager. No file fallback. |
| `GOOGLE_PLACES_API_KEY`     | Enables stays search/photo proxy                     |
| `OPENROUTER_API_KEY`        | Token for phrasebook & itinerary generation          |
| `OPENROUTER_MODEL`          | Optional default model                               |
| `REQUEST_SIGNING_SECRET`    | HMAC secret required for all non-authenticated API clients |
| `REQUEST_BODY_LIMIT`        | Override JSON payload size (default `256kb`)         |
| `STAYS_PER_USER_PER_HOUR` / `POI_PER_USER_PER_HOUR` / `PHRASEBOOK_MAX_REQUESTS_PER_HOUR` / `ITINERARY_MAX_REQUESTS_PER_HOUR` | Per-user quota knobs for external API usage |
| `FBAPP_*`                   | Firebase JS SDK config (if using client SDK server-side) |

| Variable (frontend)         | Purpose                                              |
|-----------------------------|------------------------------------------------------|
| `VITE_API_URL`              | Base API URL, include `/api` (e.g., `http://localhost:8000/api`) |
| `VITE_FIREBASE_*`           | Firebase Web App configuration                       |

> 🔐 **Secret storage**: The backend now _only_ reads credentials from `FB_ADMIN_CREDENTIALS` (formerly `FIREBASE_ADMIN_CREDENTIALS`). Encode the raw service-account JSON (or paste the JSON directly) into the env var provided by your hosting platform or local `.env`. The legacy `serviceAccountKey.json` file has been removed to avoid accidental leaks.

---

## Local Development

### Backend

```bash
cd travel-app-be
npm install
npm run dev          # nodemon server.js
```

The API will be reachable on `http://localhost:8000`. Core routes (see `API_Documentation.md` for full reference):

| Endpoint                                   | Description                                                    |
|--------------------------------------------|----------------------------------------------------------------|
| `POST /api/translate`                      | Text translation (`text`, `langPair`)                          |
| `POST /api/phrasebook/generate`            | Topic-based phrase suggestions                                 |
| `GET /api/saved-phrases`                   | List user phrases (auth required)                              |
| `POST /api/saved-phrases`                  | Save phrase (auth required)                                    |
| `DELETE /api/saved-phrases/:id`            | Remove phrase (auth required)                                  |
| `GET /api/stays/search`                    | Search lodging (dest/lat/lng filters)                          |
| `GET /api/stays/:id`                       | Detailed stay info                                             |
| `GET /api/stays/photo`                     | Proxy Google Places photos                                     |
| `GET /api/poi/search`                      | Search points of interest                                      |
| `GET /api/poi/:id`                         | Detailed POI information                                       |
| `GET /api/culture/brief`                   | Cultural intelligence brief (cached Firestore handoff)         |
| `POST /api/culture/qa`                     | Conversational culture coach                                   |
| `POST /api/culture/contextual`             | Micro-tips for translation/POI/stay contexts                   |
| `GET /api/cultural-etiquette`              | Legacy alias for the culture brief                             |
| `GET /api/itinerary/generate`              | Generate itineraries (used by Discover Itinerary planner beta) |

### Firestore Rules

Security rules that mirror the backend authorization live in `travel-app-be/firestore.rules`. Deploy them alongside backend changes so direct Firestore access stays tenant-scoped:

```bash
cd travel-app-be
firebase deploy --only firestore
```

The rules enforce `request.auth.uid` ownership for `/users/{uid}` documents and the nested `/saved_phrases` collection.

### Front-end

```bash
cd travel-app-fe
npm install
npm run dev          # Vite dev server on http://localhost:5173
```

By default the React app points to `VITE_API_URL`. Ensure CORS on the backend allows this origin.

Key UX modules:
- **Discover** – Unified search for POIs with filters, plus an **Itinerary planner (beta)**:
  - Users can toggle the “Itinerary” chip.
  - Configure trip via MUI-styled controls (days, budget, pace, season, interests).
  - Planner calls the backend itinerary generator (`/api/itinerary/generate`).
- **Destinations** – Curated destination cards and a **Destination Details** view:
  - Details pages integrate map, photos, reviews, etiquette, and a “Plan itinerary” button that deep-links into Discover with context.
- **Stays, Translation, Phrasebook, Emergency** – Accessible via the shared layout and aligned with the same MUI/Tailwind design tokens.

### Shared Travel Context & Cultural Signals

A dedicated Redux slice (`travel-app-fe/src/store/slices/travelContextSlice.js`) keeps destination metadata, coordinates, and language pairs synchronized across surfaces through the `useTravelContext` hook. Any screen can call `setDestinationContext`, `setLanguagePair`, or `resetTravelContext` to participate in the global travel state without duplicating logic.

- **State persistence**: The travel context is persisted with `redux-persist` (whitelisting the `travelContext` slice), so language/destination choices survive page refreshes. Wrapped in `PersistGate` in `src/main.jsx`.
- **Discover, Destinations, and Destination Details** push geocoded payloads from `/api/poi/search` or POI cards into the context so `StaysSearchPage` automatically pre-fills the search box, query params, and map viewport when you navigate back.
- **Stays search** writes every `resolvedDestination` returned by `/api/stays/search` (display label + lat/lng) into the context and analytics log so Emergency, Discover, and Cultural flows reuse the canonical location even when the traveler typed free-form text.
- **Emergency.jsx** consumes the context to auto-select contacts and, when the traveler manually searches a country/alias (backed by `travel-app-fe/src/data/emergencyLocationAliases.js`), feeds normalized city/country data back through `setDestinationContext` to keep Stays/Destinations aligned.
- **Translation, Phrasebook, Cultural Guide/Etiquette, and Discover** surfaces call `setLanguagePair`, ensuring `/api/translate`, `/api/phrasebook/generate`, and the `/api/culture/*` endpoints run with the same language preferences. Culture briefs are cached in Firestore (`cultureIntelligenceBriefs`) for 24 hours per destination/culture/language combo—bump `CULTURE_BRIEF_CACHE_VERSION` to invalidate stale advice.

---

## Deployment Notes

- **Backend**: Deploy the Express app to your preferred host (Render, Fly.io, Firebase Cloud Run, etc.). Inject the base64-encoded service-account JSON via the `FB_ADMIN_CREDENTIALS` env var—never ship credential files with the image. Enforce HTTPS, add production CORS origins, and consider containerizing the service.
- **Front-end**: `npm run build` produces a static bundle in `travel-app-fe/dist`. Deploy to Firebase Hosting, Vercel, Netlify, or S3/CloudFront.
- **Scheduled warmups**: The translation pipeline uses on-demand `@xenova/transformers` models. Consider provisioning a background job (cron) to hit `/api/translate/warmup` to keep models cached.

### Firebase Hosting + Functions Automation

Use `scripts/firebase-deploy.sh` to build the React frontend, copy the output into `travel-app-be/public`, and deploy both Hosting + backend Functions with a single command:

```bash
./scripts/firebase-deploy.sh --project your-firebase-project
```

Prerequisites:

1. Install the Firebase CLI (`npm install -g firebase-tools`) and run `firebase login` once.
2. Configure `.firebaserc` or supply `--project` / `FIREBASE_DEPLOY_PROJECT` to point at the right Firebase project.
3. Ensure your backend secrets are set via `.env` or the `travel-app-be/scripts/set-firebase-secrets.sh` helper.

Flags:

- `--skip-frontend` &mdash; reuses the last `travel-app-fe/dist` build.
- `--project` &mdash; overrides the Firebase project passed to `firebase deploy` (falls back to `.firebaserc` otherwise).

---

## Testing

- **Backend** (`travel-app-be`): `npm test` runs Jest + Supertest integration coverage for request signing, auth gates, and critical API flows.
- **Frontend** (`travel-app-fe`): `npm run test` runs Vitest + Testing Library suites for auth services, feature-flag gating, and future UI hooks.

Both commands automatically provision mocked Firebase/OpenRouter/Google dependencies so they can run locally or in CI without external keys.

## CI/CD (GitHub Actions)

- **CI checks**: `.github/workflows/ci.yml` runs on PRs and pushes to `main` using Node 20. It installs deps, runs frontend tests + build, backend tests, and Cloud Functions lint. Dummy keys are injected so tests/builds run without external secrets.
- **Deploy**: `.github/workflows/deploy.yml` runs on `main` pushes (or manual dispatch) and calls `scripts/firebase-deploy.sh` to build the Vite frontend, sync it into `travel-app-be/public`, and deploy Firebase Hosting + the `backend` Functions codebase.
- **Required GitHub secrets for deploy**:
  - `FIREBASE_SERVICE_ACCOUNT`: JSON for a service account with Firebase Hosting + Functions deploy perms.
  - `FIREBASE_PROJECT_ID`
  - Frontend build vars: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_API_URL`.

---

## Observability & Quality Checklist

- Keep unit/integration tests (Jest/Supertest for APIs, Vitest + Testing Library for UI/services) green in CI.
- Configure linting (`eslint`, `prettier`) and type checking (TypeScript or JSDoc) as pre-commit checks.
- Introduce structured logging (pino/winston) plus request IDs in the backend.
- Provision error monitoring (Sentry, Firebase Crashlytics) and performance tracing (OpenTelemetry) for end-to-end visibility.
- Automate CI (GitHub Actions or GitLab CI) for lint/test/build plus deploy previews.
- Keep `API_Documentation.md`, `ENVIRONMENT_VARIABLES.md`, and `MONITORING_LOGGING.md` in sync with any new routes or env vars (including itinerary and POI features).

---

## Production Readiness Checklist

1. **Security & Auth**
   - Enforce HTTPS everywhere and manage Firebase tokens via secure storage.
   - Ensure *all* API routes that read/write user data require authentication. Stays/POI/itinerary/phrasebook endpoints now enforce Firebase auth + quotas—mirror the same pattern for future routes.
   - Rotate API keys regularly and store them in a secrets manager (Vault, SSM, Secrets Manager).
2. **Data & Storage**
   - Define Firestore security rules for per-user data.
   - Add schema validation (zod/Joi) on both client and server sides.
   - Implement rate limiting/bot protection beyond the basic global limiter.
3. **Resilience**
   - Add retries/backoff for upstream APIs (OpenRouter, Google Places).
   - Cache expensive responses (translation results, stays search) using Redis or Firestore.
   - Provide graceful fallbacks/offline modes for critical data (saved phrases, emergency numbers).
4. **UX & Accessibility**
   - Implement loading skeletons and optimistic UI for mutations.
   - Add localization/i18n for the interface itself.
   - Audit accessibility (ARIA labels, keyboard navigation, contrast).
5. **Operations**
   - Document deployment pipelines, rollback procedures, backup strategy, and incident runbooks.
   - Add analytics and feature flagging for gradual rollouts.

Use this checklist as a living document as you harden the product.

---

## Contributing

1. Fork and create a feature branch.
2. Keep commits small and focused; reference issues when applicable.
3. Run lint/tests before opening a PR.

---

## License

This project is released under the MIT License. See `LICENSE` for details.
