import Icon from "./Icons.jsx";
import { STAGES, formatDate, initials } from "../lib/constants.js";
import { StageBadge } from "./UI.jsx";

export default function CandidateTable({ candidates, busyId, onStageChange, onEdit, onDelete }) {
  return <div className="table-wrap"><table className="table"><thead><tr><th>Candidate</th><th className="hide-md">Job title</th><th>Stage</th><th className="hide-lg">Applied</th><th className="right">Actions</th></tr></thead><tbody>
    {candidates.map((candidate) => <tr key={candidate._id}>
      <td><div className="person"><span className="avatar">{initials(candidate.name)}</span><div className="person-text"><span className="person-name">{candidate.name}</span><span className="person-sub">{candidate.email}</span></div></div></td>
      <td className="hide-md">{candidate.jobTitle}</td>
      <td><div className="stage-cell"><StageBadge stage={candidate.stage} /><select className="stage-select" aria-label={`Move ${candidate.name} to another stage`} value={candidate.stage} disabled={busyId === candidate._id} onChange={(event) => onStageChange(candidate, event.target.value)}>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></div></td>
      <td className="hide-lg">{formatDate(candidate.appliedAt)}</td>
      <td><div className="row-actions"><button className="icon-btn" aria-label={`Edit ${candidate.name}`} onClick={() => onEdit(candidate)}><Icon name="edit" /></button><button className="icon-btn icon-btn-danger" aria-label={`Delete ${candidate.name}`} onClick={() => onDelete(candidate)}><Icon name="trash" /></button></div></td>
    </tr>)}
  </tbody></table></div>;
}
