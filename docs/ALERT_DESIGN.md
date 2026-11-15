# Alerting design

The alert-policy utility detects consecutive failed observations. It does not send notifications.

Before production alerting:
1. Persist ordered observations per target.
2. Set probe intervals and failure thresholds.
3. Debounce repeated notifications and record acknowledgements.
4. Define recovery behavior and notification channels.
5. Test timeouts, DNS failures, transient errors, and missing observations.
6. Protect target configuration from SSRF and unauthorized edits.

Never interpret a single failed probe as a confirmed service outage.
