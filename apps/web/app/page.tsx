import LiveMonitor from "./live-monitor";
import DemoServices from "./demo-services";
export default function Home() {
  return <main className="layout"><aside className="sidebar"><div className="brand"><span className="brandicon">◈</span> DevPulse</div><p className="navtitle">WORKSPACE</p><div className="navitem">▦ &nbsp; Overview</div><div className="navdisabled">◷ &nbsp; History <small>Soon</small></div><div className="navdisabled">▥ &nbsp; Alerts <small>Soon</small></div><div className="sidebarfoot">Early preview · v0.3</div></aside>
  <div className="content"><header><span>Monitoring / Overview</span><span className="preview">Prototype</span></header><section className="hero"><p className="eyebrow">APPLICATION OBSERVABILITY</p><h1>Know how your apps are doing.</h1><p>Run real HTTPS checks for approved endpoints and inspect current response times. Persistent history and alerting are still planned.</p></section>
  <LiveMonitor/><DemoServices/><div className="notice"><strong>Prototype limitations</strong><p>Live checks run only on demand. The separate service preview below contains fictional records and is not connected to real monitoring.</p></div></div></main>;
}
