"use client";
import { useState } from "react";
type Check = {target:string;status:"healthy"|"degraded";statusCode:number|null;latencyMs:number;checkedAt:string;source:"live"};
type Alert = {target: string; consecutiveFailures: number; checkedAt: string};
type ChecksResponse = {source:"live";results:Check[]};
const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_VERCEL_URL ? "/api" : "http://localhost:4000");
export default function LiveMonitor() {
  const [token, setToken] = useState("");
  const authorization: Record<string, string> = token ? {Authorization: `Bearer ${token}`} : {};
  const [checks,setChecks] = useState<Check[]>([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [lastRefresh,setLastRefresh] = useState("");
  async function refresh() {
    setLoading(true);setError("");
    try {
      const response = await fetch(API+"/monitor/checks",{cache:"no-store",headers:authorization,signal:AbortSignal.timeout(65000)});
      if (!response.ok) throw new Error(`Monitoring API returned HTTP ${response.status}`);
      const data:ChecksResponse = await response.json();
      if (data.source !== "live" || !Array.isArray(data.results) || !data.results.every(c=>c.source==="live" && typeof c.target==="string" && typeof c.latencyMs==="number" && (c.status==="healthy" || c.status==="degraded"))) throw new Error("Unexpected monitoring response");
      setChecks(data.results);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Monitoring API unavailable");
      setChecks([]);
    } finally {setLoading(false);}
  }
  const [history, setHistory] = useState<Check[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [alerts, setAlerts] = useState<Alert[] | null>(null);

  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const options = {
        cache: "no-store" as const, headers: authorization, signal: AbortSignal.timeout(10000)
      };
      const [response, alertsResponse] = await Promise.all([
        fetch(API + "/monitor/history?limit=120", options),
        fetch(API + "/monitor/alerts", options),
      ]);
      if (!response.ok) throw new Error(`History API returned HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.results)) throw new Error("Unexpected monitoring history response");
      setHistory(data.results);
      if (!alertsResponse.ok) throw new Error(`Alerts API returned HTTP ${alertsResponse.status}`);
      const alertData = await alertsResponse.json();
      if (!Array.isArray(alertData.alerts)) throw new Error("Unexpected alerts response");
      setAlerts(alertData.alerts);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Monitoring history unavailable");
    } finally {
      setHistoryLoading(false);
    }
  }

  const series = new Map<string, Check[]>();
  for (const check of (history ?? []).slice().reverse()) {
    const points = series.get(check.target) ?? [];
    points.push(check);
    series.set(check.target, points);
  }
  const healthy = checks.filter(c=>c.status==="healthy").length;
  const measured = checks.filter(c=>Number.isFinite(c.latencyMs));
  const average = measured.length ? Math.round(measured.reduce((s,c)=>s+c.latencyMs,0)/measured.length) : null;
  const maxLatency = Math.max(1,...checks.map(c=>c.latencyMs));
  return <section className="live" aria-label="Live endpoint monitoring">
    <label htmlFor="monitor-token">Operator token (if configured)</label>
    <input id="monitor-token" type="password" value={token} onChange={event => setToken(event.target.value)} autoComplete="off" />
    <div className="demohead"><div><h2>Live endpoint checks</h2><p>Operator-configured HTTPS targets only. Run an on-demand probe or load recent saved results.</p></div><button disabled={loading} onClick={refresh}>{loading?"Checking…":"Run checks"}</button></div>
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
          {history.slice(0, 20).map((check, index) => <li key={`${check.target}-${check.checkedAt}-${index}`}>
            <time dateTime={check.checkedAt}>{new Date(check.checkedAt).toLocaleString()}</time>
            {" · "}{check.target}{" · "}{check.status}{" · "}{check.latencyMs} ms
          </li>)}
        </ol>}
      </div>
      {Array.from(series, ([target, points]) => {
        const peak = Math.max(1, ...points.map(point => point.latencyMs));
        return <article key={target}>
          <h4>{target} latency over time</h4>
          <p>Oldest to newest · peak {peak} ms</p>
          <div style={{display:"flex", alignItems:"end", gap:2, height:80}}>
            {points.map((point, index) => <div key={index} role="img"
              aria-label={`${point.checkedAt}: ${point.latencyMs} ms, ${point.status}`}
              title={`${new Date(point.checkedAt).toLocaleString()}: ${point.latencyMs} ms, ${point.status}`}
              style={{flex:1, height:`${Math.max(3, point.latencyMs / peak * 100)}%`,
                background:point.status === "healthy" ? "#34d399" : "#fb7185"}} />)}
          </div>
        </article>;
      })}
    </section>
    {alerts && <section id="monitor-alerts" aria-label="Active monitoring alerts">
      <h3>Active alerts</h3>
      {alerts.length === 0 ? <p>No active alerts.</p> : <ul>{alerts.map(alert =>
        <li key={alert.target}>{alert.target} · at least {alert.consecutiveFailures} consecutive failures</li>
      )}</ul>}
    </section>}
  </section>;
}
