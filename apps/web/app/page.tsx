import DemoServices from "./demo-services";
import LiveMonitor from "./live-monitor";

export default function Home() {
  return (
    <>
      <header className="masthead">
        <div className="masthead-inner">
          <a className="brand" href="#">DevPulse<span>.</span></a>
          <nav aria-label="Dashboard">
            <a href="#live-monitor">Live checks</a>
            <a href="#monitor-history">History</a>
          </nav>
        </div>
      </header>
      <main className="content">
        <section className="hero" aria-labelledby="dashboard-title">
          <div className="hero-copy">
            <h1 id="dashboard-title">How are your apps doing?</h1>
            <p>Check your endpoints and see how quickly they respond.</p>
            <a href="#live-monitor">Go to live checks <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-photo">
            <div className="hero-example">
              <span>Example check</span>
              <strong><i aria-hidden="true" /> Healthy · HTTP 200</strong>
              <span>Response time <b>142 ms</b></span>
            </div>
          </div>
        </section>
        <div id="live-monitor">
          <LiveMonitor />
        </div>
        <DemoServices />
        <footer>
          <p>Scheduled checks require a continuously running API.</p>
          <a href="https://unsplash.com/photos/macbook-pro-on-brown-wooden-table-nj3HSbsNLGc">Desk photo by Michał Parzuchowski on Unsplash</a>
        </footer>
      </main>
    </>
  );
}
