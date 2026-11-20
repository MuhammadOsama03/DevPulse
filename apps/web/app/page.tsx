import LiveMonitor from "./live-monitor";
import DemoServices from "./demo-services";
export default function Home() {
  return <main className="layout"><aside className="sidebar"><div className="brand"><span className="brandicon">◈</span> DevPulse</div><p className="navtitle">WORKSPACE</p><div className="navitem">▦ &nbsp; Overview</div><a className="navitem" href="#monitor-history">◷ &nbsp; History</a><div className="navdisabled">▥ &nbsp; Alerts <small>Soon</small></div><div className="sidebarfoot">Early preview · v0.3</div></aside>
  <div className="content"><header><span>Monitoring / Overview</span><span className="preview">Prototype</span></header><section className="hero"><p className="eyebrow">APPLICATION OBSERVABILITY</p><h1>Know how your apps are doing.</h1><p>Run real HTTPS checks for approved endpoints and inspect current response times. View saved checks from the monitoring history.</p></section>
  <LiveMonitor/><DemoServices/><div className="notice"><strong>Prototype limitations</strong><p>The API runs scheduled checks while it is online. The service preview uses sample records.</p></div></div></main>;
}
