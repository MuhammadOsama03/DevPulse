"use client";
import { useCallback, useState } from "react";
type Check = {target:string;status:"healthy"|"degraded";statusCode:number|null;latencyMs:number;checkedAt:string;source:"live"};
type ChecksResponse = {source:"live";results:Check[]};
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export default function LiveMonitor() {
  const [checks,setChecks] = useState<Check[]>([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [lastRefresh,setLastRefresh] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);setError("");
    try {
      const response = await fetch(API+"/monitor/checks",{cache:"no-store",signal:AbortSignal.timeout(65000)});
      if (!response.ok) throw new Error(`Monitoring API returned HTTP ${response.status}`);
      const data:ChecksResponse = await response.json();
      if (data.source !== "live" || !Array.isArray(data.results) || !data.results.every(c=>c.source==="live" && typeof c.target==="string" && typeof c.latencyMs==="number" && (c.status==="healthy" || c.status==="degraded"))) throw new Error("Unexpected monitoring response");
      setChecks(data.results);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Monitoring API unavailable");
      setChecks([]);
    } finally {setLoading(false);}
  },[]);
  const [history, setHistory] = useState<Check[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const response = await fetch(API + "/monitor/history?limit=20", {
        cache: "no-store", signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) throw new Error(`History API returned HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.results)) throw new Error("Unexpected monitoring history response");
      setHistory(data.results);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Monitoring history unavailable");
    } finally {
      setHistoryLoading(false);
    }
  }

  const healthy = checks.filter(c=>c.status==="healthy").length;
  const measured = checks.filter(c=>Number.isFinite(c.latencyMs));
  const average = measured.length ? Math.round(measured.reduce((s,c)=>s+c.latencyMs,0)/measured.length) : null;
  const maxLatency = Math.max(1,...checks.map(c=>c.latencyMs));
  return <section className="live" aria-label="Live endpoint monitoring">
    <div className="demohead"><div><h2>Live endpoint checks</h2><p>Operator-configured HTTPS targets only. Run an on-demand probe or load saved results from the scheduled monitor.</p></div><button disabled={loading} onClick={refresh}>{loading?"Checking…":"Run checks"}</button></div>
    {lastRefresh && <p className="timestamp">Last refreshed: {lastRefresh}</p>}
    {error && <p role="alert" className="liveerror">{error}</p>}
    <div className="metrics"><div><small>Configured targets checked</small><strong>{checks.length}</strong></div><div><small>Healthy responses</small><strong>{checks.length ? healthy : "—"}</strong></div><div><small>Average probe duration</small><strong>{average === null ? "—" : average+" ms"}</strong></div></div>
    {!loading && !error && checks.length===0 && <p className="empty">No live results yet. Run checks after configuring MONITOR_TARGETS on the API server. Empty results can also mean no targets are configured.</p>}
    {checks.length>0 && <div className="livechecks">
      <h3>Latest probe durations</h3>
      {checks.map(c=><article key={c.target}>
        <div className="checktop"><strong className="target">{c.target}</strong><span className={c.status==="healthy"?"ok":"bad"}>{c.status}</span></div>
        <div className="bartrack"><div className="barfill" style={{width:`${Math.max(1,Math.round(c.latencyMs/maxLatency*100))}%`}}/></div>
        <div className="checkmeta"><span>{c.latencyMs} ms · HTTP {c.statusCode??"no response"}</span><time dateTime={c.checkedAt}>{new Date(c.checkedAt).toLocaleString()}</time></div>
      </article>)}
      <p className="timestamp">Bars compare the latest single probe duration for each target. They are not historical trend charts.</p>
    </div>}
    <section id="monitor-history" className="livechecks" aria-label="Recent monitoring history">
      <h3>Recent monitoring history</h3>
      <button type="button" disabled={historyLoading} onClick={loadHistory}>
        {historyLoading ? "Loading history…" : history ? "Refresh history" : "Load history"}
      </button>
      {historyError && <p role="alert" className="liveerror">{historyError}</p>}
      <div aria-live="polite">
        {history?.length === 0 && <p>No probes have been recorded.</p>}
        {history && history.length > 0 && <ol>
          {history.map((check, index) => <li key={`${check.target}-${check.checkedAt}-${index}`}>
            <time dateTime={check.checkedAt}>{new Date(check.checkedAt).toLocaleString()}</time>
            {" · "}{check.target}{" · "}{check.status}{" · "}{check.latencyMs} ms
          </li>)}
        </ol>}
      </div>
    </section>
  </section>;
}
