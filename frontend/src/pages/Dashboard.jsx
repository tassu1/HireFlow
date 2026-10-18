import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { formatDate, initials, STAGES } from "../lib/constants.js";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api.getStats().then((data) => setStats(data.stats)).catch((err) => setError(err.message));
  }, [refresh]);

  if (error) return <div className="state"><p className="state-title">Could not load dashboard</p><p className="muted">{error}</p><button className="btn btn-secondary" onClick={() => { setError(""); setStats(null); setRefresh((n) => n + 1); }}>Try again</button></div>;
  if (!stats) return <div className="state"><p className="muted">Loading dashboard...</p></div>;
  const max = Math.max(1, ...stats.pipeline.map((item) => item.count));

  return <div className="stack">
    <div className="page-head"><p className="muted">Where your candidates stand today.</p><Link to="/candidates?new=1" className="btn btn-primary">＋ Add candidate</Link></div>
    <div className="stats-grid">
      {[{ label: "Total candidates", value: stats.total, tone: "tone-indigo" }, { label: "In pipeline", value: stats.active, tone: "tone-sky" }, { label: "Hired", value: stats.hired, tone: "tone-green" }, { label: "Rejected", value: stats.rejected, tone: "tone-rose" }].map((item) => <div className="card stat" key={item.label}><span className={`stat-icon ${item.tone}`}>{item.label === "Total candidates" ? "#" : item.label === "In pipeline" ? "↗" : item.label === "Hired" ? "✓" : "×"}</span><div><p className="stat-label">{item.label}</p><p className="stat-value">{item.value}</p></div></div>)}
    </div>
    <div className="dash-grid">
      <section className="card pad"><h2 className="section-title">Hiring pipeline</h2><ul className="pipeline" aria-label="Candidates per hiring stage">{STAGES.map((stage) => { const count = stats.byStage[stage] || 0; return <li key={stage} className="pipeline-row"><span className="pipeline-label">{stage}</span><span className="pipeline-track"><span className="pipeline-bar" data-stage={stage} style={{ width: `${(count / max) * 100}%` }} /></span><span className="pipeline-count">{count}</span></li>; })}</ul></section>
      <section className="card"><div className="section-head"><h2 className="section-title">Recently added</h2><Link to="/candidates" className="link">View all</Link></div>
        {stats.recent.length === 0 ? <div className="state"><p className="state-title">No candidates yet</p><p className="muted">Add your first candidate to start tracking the pipeline.</p></div> : <ul className="recent">{stats.recent.map((candidate) => <li key={candidate._id}><div className="recent-item"><span className="avatar">{initials(candidate.name)}</span><span className="recent-text"><span className="person-name">{candidate.name}</span><span className="person-sub">{candidate.jobTitle} · {formatDate(candidate.createdAt)}</span></span><span className="badge" data-stage={candidate.stage}><span className="badge-dot" />{candidate.stage}</span></div></li>)}</ul>}
      </section>
    </div>
  </div>;
}
