# Deployment preparation (not a deployment record)

## Local launch
- Install Node.js 22+.
- Run `npm install` at repository root.
- Run `npm run dev:api` and `npm run dev:web` in separate terminals.
- Configure `MONITOR_TARGETS` as a comma-separated list of authorized HTTPS hostnames; never use private services.
- Set `MONITOR_HISTORY_PATH` to a writable persistent volume, and `MONITOR_INTERVAL_SECONDS` between 60 and 3600.
- Set `NEXT_PUBLIC_API_URL` to the reachable API origin at frontend build time.

## Release blockers / security limitations
- The monitoring endpoints are not authenticated and a GET request can trigger outbound probes. Do not expose the API publicly without authentication, abuse controls, and operator authorization.
- The SSRF policy is intentionally conservative: IPv6 DNS answers are rejected. Mixed DNS answers with any unsafe address are also rejected.
- DNS lookup waiting is bounded to 3 seconds and HTTPS request lifetime to 5 seconds after DNS. DNS resolver work cannot be cancelled by this wrapper; a full request can still take about 8 seconds. These limits require live verification before public hosting.
- Alerts are API-visible consecutive-failure conditions, not email or push notifications.
- Scheduler runs only while the single API process is alive; file history is not multi-instance safe.
- No deployment credentials or approved live target list have been supplied.

## Smoke checks (not yet demonstrated)
1. GET `/health` and confirm 200.
2. Configure an authorized HTTPS target and GET `/monitor/targets`.
3. GET `/monitor/checks` and confirm a real result with status and latency.
4. GET `/monitor/history`, restart the process and confirm persistence.
5. Exercise three consecutive controlled failures and verify `/monitor/alerts`.
6. Verify unauthorized requests are blocked by the deployment gateway and monitoring cannot reach private IPs.
7. Run backend tests, TypeScript checks and production frontend build.

### Monitoring history UI

- Start the API with a fresh history file and open **History** in the dashboard. Select **Load history** and confirm the empty state.
- Configure an authorized HTTPS target and run a check. Refresh history and confirm the row shows the target, check time, status, and latency.
- Restart the API using the same history file and confirm the row persists. Loading history should leave the saved record count unchanged.
- Stop the API and confirm that refreshing history shows an error and leaves the last successful results visible.
