const rawPort = Number(process.env.PORT ?? 4000);
export const config = {
  port: Number.isInteger(rawPort) && rawPort > 0 && rawPort <= 65535 ? rawPort : 4000,
  allowedOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
  // Prototype only: no probes, scheduler, database, or alert delivery.
  monitoringEnabled: false,
} as const;
