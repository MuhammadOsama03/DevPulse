# DevPulse demo API

These endpoints are for fictional sample data only:

- `GET /health`: basic API status
- `GET /demo/services`: sample service records with `source: "demo"` and `measured: false`
- `GET /demo/summary`: sample status counts and average sample latency with the same provenance labels

The API is not a real monitoring service. Do not use sample statuses for uptime decisions or incident response. Run `npx tsx --test src/*.test.ts` in the API workspace to exercise the lightweight utility tests.
