import test from "node:test";
import assert from "node:assert/strict";
import { shouldAlert } from "./alert-policy.js";

test("alerts after three consecutive failures", () => {
  assert.equal(shouldAlert([{ ok: true }, { ok: false }, { ok: false }, { ok: false }]), true);
});
test("does not alert for intermittent failure", () => {
  assert.equal(shouldAlert([{ ok: false }, { ok: true }, { ok: false }]), false);
});
test("rejects zero threshold", () => assert.throws(() => shouldAlert([], 0), RangeError));
