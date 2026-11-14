# Live monitoring prototype

Set `MONITOR_TARGETS` in the API server environment to a comma-separated list of **operator-owned public HTTPS endpoints**, e.g. `https://example.com/health`. Do not monitor sites without permission. Then request `GET /monitor/checks` for real HEAD checks (up to 10 targets), or `GET /monitor/targets` to inspect configured targets.

Safety: request URLs are not accepted; HTTP, IP literals, non-443 ports, URL credentials and private/reserved DNS answers are rejected. DNS resolution is pinned to the validated address for the TLS connection; redirects are not followed. Each probe has a five-second timeout and returns status, HTTP status code, elapsed milliseconds and timestamp. A non-2xx/3xx status is degraded. Some services reject HEAD requests and may need an explicitly supported GET strategy later.

**Limitations:** No authentication, persistent metrics, scheduling, rate limits, or production deployment. Monitoring is synchronous and only runs when `/monitor/checks` is called. Configure targets only in a trusted server environment, and do not expose this prototype publicly without additional controls.
