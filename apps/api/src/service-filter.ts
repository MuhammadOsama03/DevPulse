import type { Service } from "./sample.js";

export function filterServices(services: readonly Service[], status?: Service["status"]): Service[] {
  return services.filter(service => !status || service.status === status).map(service => ({ ...service }));
}
