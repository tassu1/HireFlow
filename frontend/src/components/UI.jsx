import { useEffect, useState } from "react";
import Icon from "./Icons.jsx";

export function StageBadge({ stage }) {
  return <span className="badge" data-stage={stage}><span className="badge-dot" />{stage}</span>;
}

export function Loading({ label = "Loading..." }) {
  return <div className="state" role="status"><span className="spinner" aria-hidden="true" /><p className="muted">{label}</p></div>;
}

export function ErrorState({ message, onRetry }) {
  return <div className="state" role="alert"><span className="state-icon danger"><Icon name="alert" size={28} /></span><p className="state-title">Something went wrong</p><p className="muted">{message}</p>{onRetry && <button className="btn btn-secondary" onClick={onRetry}>Try again</button>}</div>;
}

export function EmptyState({ title, hint, action }) {
  return <div className="state"><p className="state-title">{title}</p><p className="muted">{hint}</p>{action}</div>;
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previous; };
  }, [onClose]);

  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={20} /></button></div><div className="modal-body">{children}</div></div></div>;
}

export function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  async function confirm() { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }
  return <Modal title={title} onClose={onClose}><p className="muted">{message}</p><div className="form-actions"><button className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button><button className="btn btn-danger" onClick={confirm} disabled={busy}>{busy ? "Deleting..." : confirmLabel}</button></div></Modal>;
}

export function Pagination({ pagination, onPage }) {
  const { page, limit, total, totalPages } = pagination;
  const from = total ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);
  return <div className="pagination"><span>Showing {from}-{to} of {total}</span><div className="pagination-controls"><button className="btn btn-secondary btn-icon" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><Icon name="left" /></button><span>Page {page} of {totalPages}</span><button className="btn btn-secondary btn-icon" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page"><Icon name="right" /></button></div></div>;
}
