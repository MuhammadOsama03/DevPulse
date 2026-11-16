import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendHistory, readHistory } from "./monitor-store.js";

test("history survives repeated reads and keeps only latest 1000 checks", () => {
  const dir = mkdtempSync(join(tmpdir(), "devpulse-"));
  const previous = process.env.MONITOR_HISTORY_PATH;
  try {
    process.env.MONITOR_HISTORY_PATH = join(dir, "history.json");
    assert.deepEqual(readHistory(), []);
    const checks = Array.from({ length: 1002 }, (_, i) => ({
      target: "https://example.com/", status: "healthy" as const, statusCode: 200,
      latencyMs: i, checkedAt: new Date(1700000000000 + i * 1000).toISOString(), source: "live" as const
    }));
    appendHistory(checks);
    assert.equal(readHistory().length, 1000);
    assert.equal(readHistory()[0].latencyMs, 2);
    writeFileSync(process.env.MONITOR_HISTORY_PATH, "{bad-json");
    assert.throws(() => appendHistory(checks.slice(0, 1)));
  } finally {
    if (previous === undefined) delete process.env.MONITOR_HISTORY_PATH;
    else process.env.MONITOR_HISTORY_PATH = previous;
    rmSync(dir, { recursive: true, force: true });
  }
});
