# Monitoring acceptance checks

Run against HTTPS endpoints you own or are authorized to monitor. Configure the API allowlist before starting the web app.

- [ ] A healthy endpoint produces a status and nonnegative latency.
- [ ] An unlisted target is rejected without a network request.
- [ ] A slow endpoint terminates within the configured timeout budget.
- [ ] Three consecutive failures create an alert; recovery behavior is recorded.
- [ ] Restart the API and confirm historical probes remain available.
- [ ] Confirm dashboard errors are visible when the API is unavailable.

Record the commit SHA, environment, date and observed results. These are acceptance criteria, not evidence that checks have passed.
