# Monitoring persistence and scheduling (prototype)

Set `MONITOR_TARGETS` to a comma-separated list of operator-authorized public HTTPS URLs. Targets are normalized, deduplicated and capped at 10. Never accept arbitrary user-provided URLs.

- `MONITOR_HISTORY_PATH`: location of the JSON history file (default `./monitor-history.json`).
- `MONITOR_INTERVAL_SECONDS`: periodic check interval (default 300; allowed 60–3600). Set an invalid value or configure no targets to disable periodic checks.
- `GET /monitor/checks`: run a check now, persist results and return active failure alerts. Returns 409 if another run is in progress.
- `GET /monitor/history?limit=100`: latest saved observations, newest first (limit 1–1000).
- `GET /monitor/alerts`: current alert conditions based on three consecutive failed observations per target.
- History is limited to the latest 1000 observations. Writes use a temporary file and rename. Corrupt files are not silently overwritten.
- Alerts are **API-visible conditions only**. There is no email, webhook, push notification or escalation.
- Checks are scheduled only while the API process is running. This is not a distributed job queue, and missed checks are not replayed.
- Storage is designed for **one API process**, not multiple replicas writing the same file. Configure a persistent volume in production.
- Monitoring endpoints have **no authentication**. Keep the API private until authentication, rate limiting and stronger network controls are added.
- Do not claim availability or production reliability without runtime and integration verification.
