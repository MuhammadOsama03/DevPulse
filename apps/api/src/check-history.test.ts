import test from "node:test";
import assert from "node:assert/strict";
import { latestChecks } from "./check-history.js";

test("returns newest first", () => {
  const rows = [{ timestamp: "2026-01-01T00:00:00Z", target: "a", ok: true }, { timestamp: "2026-01-02T00:00:00Z", target: "a", ok: false }];
  assert.equal(latestChecks(rows, 1)[0].ok, false);
  assert.equal(rows[0].ok, true);
});
test("rejects negative limit", () => assert.throws(() => latestChecks([], -1), RangeError));
