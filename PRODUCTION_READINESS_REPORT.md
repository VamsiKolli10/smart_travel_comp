# VoxTrail production readiness report

Assessment date: August 29, 2026  
Scope: React frontend, Express/Firebase backend, security, testing, deployment, operations, and the UX/UI refresh.

## Executive verdict

**CONDITIONAL NO-GO for unrestricted public production launch.**

The product surface is substantial and the frontend build succeeds. This pass added health/readiness endpoints, request IDs, safer signature verification, bounded AI requests, POST itinerary support, production-only authentication and durable AI quotas, legal routes, and fail-closed CI/deploy behavior. The release still needs stronger runtime assurance before public traffic: the full frontend suite is not green, the backend suite could not execute in this restricted environment, dependency audit results could not be refreshed without registry access, and key production controls require verification in staging.

A controlled staging or internal beta is reasonable after provider secrets and Firebase targets are configured. Public launch should wait for the P0 items below.

## Scorecard

| Area | Status | Finding |
|---|---|---|
| Product and UI | Ready with follow-ups | Shared visual system, responsive shell, clearer hierarchy, dark mode, focus states, and reduced-motion support are in place. |
| Frontend build | Passed with warning | Vite production build succeeds; main bundle is approximately 3.7 MB uncompressed and 884 KB gzip. |
| Frontend tests | Blocked | 33 test files are present, but the full run currently reports 16 failures. Directly affected appearance, feature-flag, and navbar tests pass 11/11. |
| Backend tests | Not verified | 26 backend tests are present, but Jest/Supertest cannot bind a listener in this sandbox (`EPERM` on `0.0.0.0`). Run in CI or staging. |
| Security | Improved; needs verification | Auth, CORS, Helmet, validation, Firestore deny-by-default rules, request IDs, safer HMAC checks, and durable production AI quotas exist; production configuration and dependency advisories still need closure. |
| Deployment | At risk | Separate frontend/backend Firebase configurations and hosting roots exist; the canonical production target must be made explicit and smoke-tested. |
| Observability | At risk | Documentation is extensive, but live structured logs, error reporting, health checks, dashboards, and alerts need evidence from staging. |
| Privacy/legal | Blocked until confirmed | Registration links to Terms and Privacy routes; verify both are real, reviewed, versioned, and accessible before consent. |

## P0 release blockers

### 1. Full test suite is not green

The frontend has a real Vitest/Testing Library suite, but the full run reports failures in feature-flag/appearance storage behavior, login verification, phrasebook, stays search, and translation flows. Some failures are test-environment/localStorage or mocked-provider related, but they remain release risk until diagnosed and fixed or explicitly quarantined.

Backend tests exist and are configured for Jest/Supertest. They were not executable in this environment because the test server attempted to listen on `0.0.0.0` and the sandbox returned `EPERM`.

Exit criterion: clean-checkout CI passes frontend and backend tests deterministically, with no unhandled errors.

### 2. Production dependency risk is not currently verified

`npm audit` could not reach the npm registry from this environment, so current advisory counts are not reliable. The previous report’s audit numbers should not be treated as current evidence.

Exit criterion: run `npm audit --omit=dev` for frontend, backend, and Functions in CI; remediate critical/high findings or record time-bound, security-reviewed exceptions.

### 3. Cost-generating AI endpoints need staging verification

Itinerary, culture, and phrasebook generation routes now use production-only verified authentication and durable Firestore daily quotas; itinerary also supports POST and the frontend uses it. Validate the behavior in staging and add provider spending alerts plus a kill switch.

Exit criterion: a multi-instance load test proves quotas and provider caps hold under replay and parallel traffic.

### 4. Runtime observability needs proof

Request IDs plus `/healthz` and `/readyz` are now implemented. Error reporting, latency/error metrics, provider-cost metrics, uptime checks, and actionable alerts still need staging evidence. Ensure logs never contain tokens, full user prompts, or sensitive location data.

Exit criterion: staging produces correlated frontend/backend errors and alerts on a synthetic failure.

### 5. Legal and consent paths must be complete

Confirm `/terms` and `/privacy` resolve to reviewed documents rather than a generic fallback. The policies should cover Firebase Auth, location data, analytics, AI providers, retention, deletion, and support contact information.

Exit criterion: legal review complete and consent version is auditable.

## P1 hardening items

- Select one canonical Firebase project and deployment topology. The repository currently contains separate frontend and backend Firebase configurations.
- Validate required production environment variables at startup and fail closed; never use placeholder signing secrets in production.
- OpenRouter now has a configurable 30-second timeout and 256 KB response/body limits; apply the same policy consistently to all Google/provider calls.
- Review request-signing bypass rules, malformed-signature handling, rate-limit error codes, and any duplicate route registrations.
- Add Firebase Hosting CSP, HSTS, Referrer-Policy, Permissions-Policy, and cache rules for hashed assets.
- Verify Firestore rules, indexes, service-account permissions, key restrictions, and secret rotation in the actual production project.
- Run backup/restore and rollback drills before launch.

## P2 improvements

- Split the large frontend bundle with route-level dynamic imports, especially maps, Firebase, and translation/model features.
- Add automated axe checks and keyboard/screen-reader regression coverage.
- Add provenance, last-reviewed dates, geographic limits, and disclaimers to emergency and cultural guidance.
- Add visible uncertainty/accuracy guidance for AI-generated itineraries and culture content.
- Establish SLOs for API latency, error rate, provider failures, search freshness, and frontend Core Web Vitals.
- Remove or archive generated artifacts and keep release documentation synchronized with executable configuration.

## Confirmed strengths

- Frontend production build passes.
- Frontend and backend test suites are present and wired to package scripts.
- GitHub Actions CI and deploy workflow files are present.
- Firebase Auth, protected routes, role checks, validation, CORS allowlisting, Helmet, centralized errors, and Firestore rules are implemented.
- The UX/UI refresh improves shared navigation, layout, typography, responsiveness, accessibility focus behavior, and reduced-motion behavior.
- No tracked service-account key was found in the repository; environment files are ignored.
- Directly affected UI tests pass: appearance, feature flags, and navbar, 11/11.

## Validation performed

| Check | Result |
|---|---|
| Frontend `npm run build` | Passed |
| Frontend focused tests | Passed, 11/11 |
| Frontend full `npm test` | Not passing, 16 failures reported |
| Backend `npm test` | Not verified; sandbox listener permission error |
| Frontend/backend `npm ci` | Completed from lockfiles |
| Dependency audit | Not verified; npm registry unavailable |
| CI workflow presence | Confirmed: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` |
| Authenticated staging smoke test | Not run; requires configured credentials/providers |

## Recommended order to reach GO

1. Reproduce and resolve the full frontend failures; run backend tests in CI.
2. Run dependency audits with registry access and remediate critical/high findings.
3. Harden and load-test AI quotas and external-provider resilience.
4. Verify secrets, Firebase targets, hosting headers, legal routes, health checks, and alerts in staging.
5. Execute rollback, backup/restore, accessibility, mobile performance, and post-deploy smoke tests.
6. Launch a small monitored beta before general availability.

## Final launch gate

- [ ] Full CI passes from a clean checkout.
- [ ] No unaccepted critical/high production dependency advisories.
- [ ] AI/provider quotas and spending caps are durable and tested.
- [ ] Production secrets fail closed and are supplied by the platform.
- [ ] Health checks, structured logs, error reporting, dashboards, and paging alerts are live.
- [ ] One canonical deployment target and tested rollback path are documented.
- [ ] Terms and Privacy are accessible before consent.
- [ ] Accessibility and mobile performance checks pass.
- [ ] Backup/restore and incident-response drills are complete.
- [ ] Production post-deploy smoke tests pass.

## Conclusion

VoxTrail is a credible product with a materially improved interface and a promising engineering foundation. It is not yet ready for unrestricted public launch because the release evidence is incomplete and the current frontend suite is not green. Treat the next milestone as a hardening sprint followed by a monitored beta, not general availability.
