import { useState } from "react";
import { ApiError } from "../lib/api.jsx";
import { STAGES } from "../lib/constants.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Name is required";
  if (!values.email.trim()) errors.email = "Email is required";
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = "Enter a valid email address";
  if (!values.jobTitle.trim()) errors.jobTitle = "Job title is required";
  if (values.resumeUrl.trim()) {
    try {
      const url = new URL(values.resumeUrl.trim());
      if (!/^https?:$/.test(url.protocol)) throw new Error();
    } catch {
      errors.resumeUrl = "Enter a valid http(s) URL";
    }
  }
  return errors;
}

export default function CandidateForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    jobTitle: initial?.jobTitle ?? "",
    resumeUrl: initial?.resumeUrl ?? "",
    stage: initial?.stage ?? "Applied",
    notes: initial?.notes ?? "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((errs) => ({ ...errs, [key]: "" }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) {
        setErrors(err.fieldErrors);
      } else {
        setFormError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  const field = (key, label, input, required = false) => (
    <div className="field">
      <label htmlFor={`f-${key}`}>
        {label} {required && <span className="req" aria-hidden="true">*</span>}
      </label>
      {input}
      {errors[key] && <p className="field-error" role="alert">{errors[key]}</p>}
    </div>
  );

  const cls = (key) => `input ${errors[key] ? "input-error" : ""}`;

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      {formError && <div className="form-error" role="alert">{formError}</div>}

      {field("name", "Full name",
        <input id="f-name" className={cls("name")} value={values.name} onChange={change("name")} maxLength={100} autoFocus />, true)}

      {field("email", "Email",
        <input id="f-email" type="email" className={cls("email")} value={values.email} onChange={change("email")} maxLength={254} />, true)}

      <div className="form-grid">
        {field("jobTitle", "Job title",
          <input id="f-jobTitle" className={cls("jobTitle")} value={values.jobTitle} onChange={change("jobTitle")} maxLength={100} />, true)}
        {field("phone", "Phone",
          <input id="f-phone" type="tel" className={cls("phone")} value={values.phone} onChange={change("phone")} maxLength={20} />)}
      </div>

      {field("resumeUrl", "Resume URL",
        <input id="f-resumeUrl" type="url" placeholder="https://" className={cls("resumeUrl")} value={values.resumeUrl} onChange={change("resumeUrl")} maxLength={500} />)}

      {field("stage", "Hiring stage",
        <select id="f-stage" className={cls("stage")} value={values.stage} onChange={change("stage")}>
          {STAGES.map((s) => <option key={s}>{s}</option>)}
        </select>)}

      {field("notes", "Notes",
        <textarea id="f-notes" rows={3} className={cls("notes")} value={values.notes} onChange={change("notes")} maxLength={2000} />)}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Saving..." : initial ? "Save changes" : "Add candidate"}
        </button>
      </div>
    </form>
  );
}
