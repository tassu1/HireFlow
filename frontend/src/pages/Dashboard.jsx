import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";
import { api } from "../lib/api.jsx";
import { formatDate, initials } from "../lib/constants.js";
import Icon from "../components/Icons.jsx";
import PipelineChart from "../components/PipelineChart.jsx";
import { StageBadge, EmptyState, ErrorState, Loading } from "../components/UI.jsx";

function StatCard({ label, value, icon, tone }) {
  return (
    <div className="card stat">
      <span className={`stat-icon ${tone}`}><Icon name={icon} size={20} /></span>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    api
      .getStats()
      .then((data) => active && setStats(data.stats))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  function retry() {
    setLoading(true);
    setError("");
    setReloadKey((k) => k + 1);
  }

  if (loading) return <Loading label="Loading dashboard..." />;
  if (error || !stats) return <ErrorState message={error} onRetry={retry} />;

  return (
    <div className="stack">
      <div className="page-head">
        <p className="muted">Where your candidates stand today.</p>
        <Link to="/candidates?new=1" className="btn btn-primary">
          <Icon name="plus" /> Add candidate
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Total candidates" value={stats.total} icon="users" tone="tone-indigo" />
        <StatCard label="In pipeline" value={stats.active} icon="flow" tone="tone-sky" />
        <StatCard label="Hired" value={stats.hired} icon="check" tone="tone-green" />
        <StatCard label="Rejected" value={stats.rejected} icon="userx" tone="tone-rose" />
      </div>

      <div className="dash-grid">
        <section className="card pad">
          <h2 className="section-title">Hiring pipeline</h2>
          <PipelineChart data={stats.pipeline} />
        </section>

        <section className="card">
          <div className="section-head">
            <h2 className="section-title">Recently added</h2>
            <Link to="/candidates" className="link">View all</Link>
          </div>

          {stats.recent.length === 0 ? (
            <EmptyState
              title="No candidates yet"
              hint="Add your first candidate to start tracking the pipeline."
            />
          ) : (
            <ul className="recent">
              {stats.recent.map((c) => (
                <li key={c._id}>
                  <div className="recent-item">
                    <span className="avatar">{initials(c.name)}</span>
                    <span className="recent-text">
                      <span className="person-name">{c.name}</span>
                      <span className="person-sub">{c.jobTitle} - {formatDate(c.createdAt)}</span>
                    </span>
                    <StageBadge stage={c.stage} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
