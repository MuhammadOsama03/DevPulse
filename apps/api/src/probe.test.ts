import assert from "node:assert/strict";
import test from "node:test";
import { isPublicAddress, parseTarget } from "./probe.js";

test("blocks private and metadata IP ranges", () => {
  for (const ip of ["127.0.0.1", "10.0.0.1", "169.254.169.254", "172.16.1.1", "192.168.1.1", "::1", "fc00::1", "::ffff:127.0.0.1"]) {
    assert.equal(isPublicAddress(ip), false, ip);
  }
});
test("accepts public IPv4", () => assert.equal(isPublicAddress("8.8.8.8"), true));
test("rejects insecure and credential-bearing targets", () => {
  for (const url of ["http://example.com", "https://user:pass@example.com", "https://127.0.0.1", "https://example.com:8443"]) {
    assert.throws(() => parseTarget(url));
  }
});
test("accepts ordinary HTTPS hostname", () => assert.equal(parseTarget("https://example.com/health").hostname, "example.com"));
