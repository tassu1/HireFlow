import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/Candidates.css";
import { api } from "../lib/api.jsx";
import { STAGES } from "../lib/constants.js";
import Icon from "../components/Icons.jsx";
import CandidateTable from "../components/CandidateTable.jsx";
import CandidateForm from "../components/CandidateForm.jsx";
import { Modal, ConfirmDialog, Pagination, EmptyState, ErrorState, Loading } from "../components/UI.jsx";
import { useToast } from "../components/Toast.jsx";

export default function Candidates() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [formOpen, setFormOpen] = useState(params.get("new") === "1");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const requestId = useRef(0); // lets us ignore responses from outdated requests

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const data = await api.listCandidates({
        search: debouncedSearch,
        stage,
        page,
        limit: 10,
      });
      if (id !== requestId.current) return;

      // The last row of the last page was removed: step back one page.
      if (data.candidates.length === 0 && data.pagination.page > 1) {
        setPage(data.pagination.totalPages);
        return;
      }
      setRows(data.candidates);
      setPagination(data.pagination);
    } catch (err) {
      if (id === requestId.current) setError(err.message);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [debouncedSearch, stage, page]);

  useEffect(() => {
    // Fetching on filter/page change is an intentional effect: load() flags
    // "loading" first so the table dims while the new results arrive.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    if (params.has("new")) setParams({}, { replace: true });
  }

  async function handleSave(values) {
    if (editing) {
      await api.updateCandidate(editing._id, values);
      toast("success", "Candidate updated");
    } else {
      await api.createCandidate(values);
      toast("success", "Candidate added");
      setSearch("");
      setStage("");
      setPage(1);
    }
    closeForm();
    load();
  }

  async function handleStageChange(candidate, next) {
    if (next === candidate.stage) return;
    setBusyId(candidate._id);
    try {
      await api.updateCandidate(candidate._id, { stage: next });
      toast("success", `${candidate.name} moved to ${next}`);
      await load();
    } catch (err) {
      toast("error", err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    try {
      await api.deleteCandidate(deleting._id);
      toast("success", "Candidate deleted");
      setDeleting(null);
      load();
    } catch (err) {
      toast("error", err.message);
      setDeleting(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setStage("");
    setPage(1);
  }

  const filtered = Boolean(debouncedSearch || stage);

  return (
    <div className="stack">
      <div className="page-head">
        <p className="muted">Search, filter and move candidates through the pipeline.</p>
        <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
          <Icon name="plus" /> Add candidate
        </button>
      </div>

      <div className="filters">
        <div className="search">
          <Icon name="search" size={16} />
          <input
            className="input"
            type="search"
            placeholder="Search by name, email or job title"
            aria-label="Search candidates"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="input filter-stage"
          aria-label="Filter by stage"
          value={stage}
          onChange={(e) => {
            setStage(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="card clip">
        {loading && rows.length === 0 ? (
          <Loading label="Loading candidates..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : rows.length === 0 ? (
          filtered ? (
            <EmptyState
              title="No candidates match your filters"
              hint="Try a different search term or clear the stage filter."
              action={<button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>}
            />
          ) : (
            <EmptyState
              title="No candidates yet"
              hint="Add a candidate who applied for a position to get started."
              action={
                <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
                  <Icon name="plus" /> Add candidate
                </button>
              }
            />
          )
        ) : (
          <div className={loading ? "dim" : ""}>
            <CandidateTable
              candidates={rows}
              busyId={busyId}
              onStageChange={handleStageChange}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
            {pagination && <Pagination pagination={pagination} onPage={setPage} />}
          </div>
        )}
      </div>

      {(formOpen || editing) && (
        <Modal title={editing ? "Edit candidate" : "Add candidate"} onClose={closeForm}>
          <CandidateForm initial={editing || undefined} onSubmit={handleSave} onCancel={closeForm} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete candidate"
          message={`Delete ${deleting.name}? This permanently removes the candidate and cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
