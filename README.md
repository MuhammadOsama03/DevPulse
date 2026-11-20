# DevPulse

A developer-focused application health and API monitoring dashboard. **Five-day sprint status (2026-11-18): prototype; not deployed or end-to-end verified.**

## Implemented in source

- Next.js frontend with operator-triggered real HTTPS checks and latency comparison bars
- Express API with operator-configured target allowlist, DNS checks, HTTPS-only probes and request timeouts
- Persistent bounded JSON history (single-process storage), scheduled monitoring while the API is running
- API-visible alerts after three consecutive failures; **no email or webhook delivery yet**
- Node API unit tests and GitHub Actions CI (check current workflow status before relying on it)

## Setup and limitations

See [monitoring and persistence](docs/PERSISTENCE.md) and [security](docs/SECURITY.md).

Configure `MONITOR_TARGETS` to authorized public HTTPS URLs, `MONITOR_INTERVAL_SECONDS` (60–3600, default 300), and a persistent `MONITOR_HISTORY_PATH` on your server. Run `npm install` then `npm run dev:api` and `npm run dev:web` from the repository root.

No deployed end-to-end workflow has been verified. The dashboard shows the latest checks and can load the 20 most recent saved probes. The API supports an optional shared operator token. Rate limiting is pending. Do not expose it publicly without additional controls. Persistent history uses a local JSON file. Multi-replica deployments are unsupported.

## Remaining work

- Authentication, rate limiting, durable multi-instance storage and notification delivery
- Historical trend charts, integration and browser tests
- Deployment configuration, security hardening and live verification

## Sprint closeout (November 18, 2026)

The source includes operator-configured HTTPS checks, bounded JSON history, an in-process scheduler, API-visible consecutive-failure alerts and a Next.js dashboard. The probe now bounds DNS waiting and HTTPS request lifetime separately. The last pre-closeout `main` CI run on November 17 succeeded; check [current Actions](https://github.com/MuhammadOsama03/DevPulse/actions) for November 18 CI results. No approved real monitoring targets, hosting credentials, production URL or browser-to-API smoke test were available. No live deployment or notification delivery is claimed.

**Remaining release blockers:** add rate limiting and per-user operator authorization, validate DNS/HTTP timeout behavior against controlled targets, use durable multi-instance storage and external scheduling for scaling, implement notification delivery, add historical dashboard charts and browser integration tests. Keep the API private until access controls and abuse protection are in place. See [deployment checklist](docs/DEPLOYMENT.md).
