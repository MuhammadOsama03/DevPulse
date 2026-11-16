# DevPulse

A developer-focused application health and API monitoring dashboard. **Prototype; not production-verified.**

## Implemented in source

- Next.js frontend with operator-triggered real HTTPS checks and latency comparison bars
- Express API with operator-configured target allowlist, DNS checks, HTTPS-only probes and request timeouts
- Persistent bounded JSON history (single-process storage), scheduled monitoring while the API is running
- API-visible alerts after three consecutive failures; **no email or webhook delivery yet**
- Node API unit tests and GitHub Actions CI (check current workflow status before relying on it)

## Setup and limitations

See [monitoring and persistence](docs/PERSISTENCE.md) and [security](docs/SECURITY.md).

Configure `MONITOR_TARGETS` to authorized public HTTPS URLs, `MONITOR_INTERVAL_SECONDS` (60–3600, default 300), and a persistent `MONITOR_HISTORY_PATH` on your server. Run `npm install` then `npm run dev:api` and `npm run dev:web` from the repository root.

No deployed end-to-end workflow has been verified. The dashboard currently shows the latest checks, not full historical trend charts. The API has no authentication or rate limiting. Do not expose it publicly without additional controls. Persistent history uses a local JSON file, **not PostgreSQL**. Multi-replica deployments are unsupported.

## Remaining work

- Authentication, rate limiting, durable multi-instance storage and notification delivery
- Dashboard history/trend views, integration and browser tests
- Deployment configuration, security hardening and live verification
