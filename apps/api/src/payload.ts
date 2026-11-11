import type { Service } from "./sample.js";

export type DemoPayload = {
  source: "demo";
  measured: false;
  services: Service[];
};

export function demoPayload(services: readonly Service[]): DemoPayload {
  return {
    source: "demo",
    measured: false,
    services: services.map(service => ({ ...service })),
  };
}
