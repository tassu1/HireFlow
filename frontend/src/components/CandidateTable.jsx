import { STAGES, formatDate, initials } from "../lib/constants.js";

export default function CandidateTable({ candidates, busyId, onStageChange, onEdit, onDelete }) {
  return <div className="table-wrap"><table className="table"><thead><tr><th>Candidate</th><th className="hide-md">Job title</th><th>Stage</th><th className="hide-lg">Applied</th><th className="right">Actions</th></tr></thead><tbody>
    {candidates.map((candidate) => <tr key={candidate._id}>
      <td><div className="person"><span className="avatar">{initials(candidate.name)}</span><div className="person-text"><span className="person-name">{candidate.name}</span><span className="person-sub">{candidate.email}</span></div></div></td>
      <td className="hide-md">{candidate.jobTitle}</td>
      <td><div className="stage-cell"><span className="badge" data-stage={candidate.stage}><span className="badge-dot" />{candidate.stage}</span><select className="stage-select" aria-label={`Move ${candidate.name} to another stage`} value={candidate.stage} disabled={busyId === candidate._id} onChange={(event) => onStageChange(candidate, event.target.value)}>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></div></td>
      <td className="hide-lg">{formatDate(candidate.appliedAt)}</td>
      <td><div className="row-actions"><button className="btn btn-secondary" onClick={() => onEdit(candidate)}>Edit</button><button className="btn btn-danger" onClick={() => onDelete(candidate)}>Delete</button></div></td>
    </tr>)}
  </tbody></table></div>;
}
