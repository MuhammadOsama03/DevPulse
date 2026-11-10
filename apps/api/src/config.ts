export const config = {
  port: Number(process.env.PORT || 4000),
  // This prototype has no database, scheduler, or remote monitoring credentials.
  monitoringEnabled: false,
} as const;
