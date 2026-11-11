import assert from "node:assert/strict";
import test from "node:test";
import { config } from "./config.js";

test("development origins are explicit", () => {
  assert.ok(config.allowedOrigins.includes("http://localhost:3000"));
  assert.ok(!config.allowedOrigins.includes("*"));
});

test("monitoring remains disabled", () => {
  assert.equal(config.monitoringEnabled, false);
});

test("API port is valid", () => {
  assert.ok(config.port > 0 && config.port <= 65535);
});
