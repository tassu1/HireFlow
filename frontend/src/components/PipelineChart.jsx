// Simple accessible bar chart: one row per stage, width relative to the busiest stage.
export default function PipelineChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <ul className="pipeline" aria-label="Candidates per hiring stage">
      {data.map(({ stage, count }) => (
        <li key={stage} className="pipeline-row">
          <span className="pipeline-label">{stage}</span>
          <span className="pipeline-track">
            <span
              className="pipeline-bar"
              data-stage={stage}
              style={{ width: `${(count / max) * 100}%` }}
            />
          </span>
          <span className="pipeline-count">{count}</span>
        </li>
      ))}
    </ul>
  );
}
