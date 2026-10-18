import { useState } from "react";
import { STAGES } from "../lib/constants.js";

export default function CandidateForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: initial?.name || "", email: initial?.email || "", phone: initial?.phone || "",
    jobTitle: initial?.jobTitle || "", resumeUrl: initial?.resumeUrl || "",
    stage: initial?.stage || "Applied", notes: initial?.notes || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  function change(event) { setValues({ ...values, [event.target.name]: event.target.value }); }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try { await onSubmit(values); }
    catch (err) { setError(err.message || "Could not save candidate."); }
    finally { setSaving(false); }
  }

  return <form className="form" onSubmit={submit}>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="field"><label htmlFor="name">Full name *</label><input id="name" name="name" className="input" value={values.name} onChange={change} required /></div>
    <div className="field"><label htmlFor="email">Email *</label><input id="email" name="email" type="email" className="input" value={values.email} onChange={change} required /></div>
    <div className="form-grid"><div className="field"><label htmlFor="jobTitle">Job title *</label><input id="jobTitle" name="jobTitle" className="input" value={values.jobTitle} onChange={change} required /></div><div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" className="input" value={values.phone} onChange={change} /></div></div>
    <div className="field"><label htmlFor="resumeUrl">Resume URL</label><input id="resumeUrl" name="resumeUrl" type="url" placeholder="https://" className="input" value={values.resumeUrl} onChange={change} /></div>
    <div className="field"><label htmlFor="stage">Hiring stage</label><select id="stage" name="stage" className="input" value={values.stage} onChange={change}>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></div>
    <div className="field"><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" rows={3} className="input" value={values.notes} onChange={change} /></div>
    <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : initial ? "Save changes" : "Add candidate"}</button></div>
  </form>;
}
