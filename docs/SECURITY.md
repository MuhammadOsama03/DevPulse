# DevPulse prototype security notes

DevPulse currently serves fictional demonstration records. It does not perform remote probes, store credentials, send alerts, or persist monitoring results.

The local CORS allowlist is not authentication. Do not expose this prototype as a multi-user service without authentication, authorization, request limits, logging policy, and deployment configuration review.

Do not treat demo latency values as measured uptime or response times. If real probes are introduced, validate target URLs and block private-network or metadata endpoints to avoid SSRF.
