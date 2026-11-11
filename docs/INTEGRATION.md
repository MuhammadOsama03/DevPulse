# DevPulse local integration

This increment keeps DevPulse as a **demo**, not a monitoring product.

## Run

From the repository root install dependencies, then run the API and web workspaces using the existing package scripts. The API defaults to port 4000; the Next.js frontend defaults to port 3000.

The API permits browser requests from `http://localhost:3000` and `http://127.0.0.1:3000`. Configure `NEXT_PUBLIC_API_URL` when the API is hosted elsewhere; do not deploy with unreviewed CORS origins.

## API contract

`GET /demo/services` returns `source: "demo"`, `measured: false`, and fictional service records. The frontend validates this contract and displays an error instead of presenting unknown values as real measurements.

## Tests and limitations

From the API workspace, `npx tsx --test src/*.test.ts` runs the lightweight Node tests. No database, real monitoring probes, scheduled checks, alerts, authentication, or production deployment are implemented yet. Run a TypeScript build and browser smoke test before merging or deploying.
