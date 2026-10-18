import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { STAGES } from "../lib/constants.js";
import CandidateTable from "../components/CandidateTable.jsx";
import CandidateForm from "../components/CandidateForm.jsx";

export default function Candidates() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [formOpen, setFormOpen] = useState(params.get("new") === "1");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.listCandidates({ search, stage, page, limit: 10 });
        if (!data.candidates.length && data.pagination.page > 1) {
          setPage(data.pagination.totalPages);
          return;
        }
        setRows(data.candidates);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, stage, page, refresh]);

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    if (params.has("new")) setParams({}, { replace: true });
  }

  async function saveCandidate(values) {
    try {
      if (editing) await api.updateCandidate(editing._id, values);
      else await api.createCandidate(values);
      setMessage(editing ? "Candidate updated." : "Candidate added.");
      closeForm();
      setSearch("");
      setStage("");
      setPage(1);
      setRefresh((value) => value + 1);
    } catch (err) {
      setMessage(err.message);
      throw err;
    }
  }

  async function changeStage(candidate, nextStage) {
    if (nextStage === candidate.stage) return;
    setBusyId(candidate._id);
    try {
      await api.updateCandidate(candidate._id, { stage: nextStage });
      setMessage(`${candidate.name} moved to ${nextStage}.`);
      setRefresh((value) => value + 1);
    } catch (err) { setMessage(err.message); }
    finally { setBusyId(null); }
  }

  async function deleteCandidate() {
    try {
      await api.deleteCandidate(deleting._id);
      setMessage("Candidate deleted.");
      setDeleting(null);
      setRefresh((value) => value + 1);
    } catch (err) { setMessage(err.message); setDeleting(null); }
  }

  const filtered = Boolean(search || stage);

  return <div className="stack">
    <div className="page-head"><p className="muted">Search, filter and move candidates through the pipeline.</p><button className="btn btn-primary" onClick={() => setFormOpen(true)}>＋ Add candidate</button></div>
    {message && <div className="notice" role="status">{message}<button className="link" onClick={() => setMessage("")}>Dismiss</button></div>}
    <div className="filters"><div className="search"><input className="input" type="search" placeholder="Search by name, email or job title" aria-label="Search candidates" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
      <select className="input filter-stage" aria-label="Filter by stage" value={stage} onChange={(e) => { setStage(e.target.value); setPage(1); }}><option value="">All stages</option>{STAGES.map((s) => <option key={s}>{s}</option>)}</select>
    </div>
    <div className="card clip">
      {loading && rows.length === 0 ? <div className="state"><p className="muted">Loading candidates...</p></div>
        : error ? <div className="state"><p className="state-title">Could not load candidates</p><p className="muted">{error}</p><button className="btn btn-secondary" onClick={() => setRefresh((value) => value + 1)}>Try again</button></div>
        : rows.length === 0 ? <div className="state"><p className="state-title">{filtered ? "No candidates match your filters" : "No candidates yet"}</p><p className="muted">{filtered ? "Try a different search or stage." : "Add a candidate to get started."}</p>{filtered ? <button className="btn btn-secondary" onClick={() => { setSearch(""); setStage(""); }}>Clear filters</button> : <button className="btn btn-primary" onClick={() => setFormOpen(true)}>＋ Add candidate</button>}</div>
        : <div className={loading ? "dim" : ""}><CandidateTable candidates={rows} busyId={busyId} onStageChange={changeStage} onEdit={setEditing} onDelete={setDeleting} />
          {pagination && <div className="pagination"><span>Showing {rows.length ? (page - 1) * 10 + 1 : 0}-{Math.min(page * 10, pagination.total)} of {pagination.total}</span><div className="pagination-controls"><button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Previous</button><span>Page {page} of {pagination.totalPages}</span><button className="btn btn-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next →</button></div></div>}
        </div>}
    </div>

    {(formOpen || editing) && <div className="modal-backdrop" onMouseDown={closeForm}><div className="modal" role="dialog" aria-modal="true" aria-label={editing ? "Edit candidate" : "Add candidate"} onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><h2>{editing ? "Edit candidate" : "Add candidate"}</h2><button className="icon-btn" onClick={closeForm} aria-label="Close">×</button></div><div className="modal-body"><CandidateForm initial={editing || undefined} onSubmit={saveCandidate} onCancel={closeForm} /></div></div></div>}
    {deleting && <div className="modal-backdrop" onMouseDown={() => setDeleting(null)}><div className="modal" role="dialog" aria-modal="true" aria-label="Delete candidate" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><h2>Delete candidate</h2><button className="icon-btn" onClick={() => setDeleting(null)} aria-label="Close">×</button></div><div className="modal-body"><p>Delete {deleting.name}? This cannot be undone.</p><div className="form-actions"><button className="btn btn-secondary" onClick={() => setDeleting(null)}>Cancel</button><button className="btn btn-danger" onClick={deleteCandidate}>Delete</button></div></div></div></div>}
  </div>;
}
