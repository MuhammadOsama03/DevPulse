# DevPulse development notes

## Local setup

From the repository root, run `npm install`, then use two terminals:

- `npm run dev:api` — Express API at http://localhost:4000
- `npm run dev:web` — Next.js app at http://localhost:3000

Endpoints: `GET /health` and `GET /demo/services`.

## Known integration gap

The web app requests demo data from port 4000, but the Express API does not yet enable CORS. Browser requests will fail until a suitable local development proxy or restricted CORS configuration is added. The demo endpoint can be tested directly from a terminal.

## What is not implemented

The service data is fictional and hardcoded. There are no actual probes, scheduled checks, historical metrics, alerts, database, or automated tests. Do not treat displayed sample latencies as real measurements.
