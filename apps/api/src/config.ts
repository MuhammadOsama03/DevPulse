const rawPort = Number(process.env.PORT ?? 4000);
export const config = {
  port: Number.isInteger(rawPort) && rawPort > 0 && rawPort <= 65535 ? rawPort : 4000,
  allowedOrigins: (process.env.DEVPULSE_ALLOWED_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000")
    .split(",").map(origin => origin.trim()).filter(origin => origin && origin !== "*"),
  // Legacy flag for old demo UI; actual monitor behavior is configured in index.ts.
  monitoringEnabled: false,
} as const;
