// End-to-end API check against a RUNNING server (local or deployed).
//   npm run smoke
//   API_URL=https://your-api.onrender.com/api npm run smoke
// It creates its own temporary candidates and deletes them again.
const API = (process.env.API_URL || "http://localhost:5000/api").replace(/\/$/, "");

let failed = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  " + extra}`);
  if (!ok) failed++;
};

const call = async (path, method = "GET", body) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};

const tag = Date.now();
const email = `smoke.${tag}@example.com`;
let id;

try {
  let r = await call("/health");
  check("health reports DB connected", r.status === 200 && r.data.db === "connected");

  const before = (await call("/dashboard/stats")).data.stats;

  r = await call("/candidates", "POST", { name: `Smoke Test ${tag}`, email: email.toUpperCase(), jobTitle: "QA" });
  id = r.data.candidate?._id;
  check("create candidate -> 201, email normalised, default stage Applied",
    r.status === 201 && r.data.candidate.email === email && r.data.candidate.stage === "Applied", JSON.stringify(r.data));

  r = await call("/candidates", "POST", { name: "Dup", email, jobTitle: "QA" });
  check("duplicate email -> 409", r.status === 409, `got ${r.status}`);

  r = await call("/candidates", "POST", {});
  check("missing required fields -> 400", r.status === 400 && r.data.errors?.name && r.data.errors?.email && r.data.errors?.jobTitle);

  r = await call("/candidates", "POST", { name: "X", email: "not-an-email", jobTitle: "QA" });
  check("invalid email -> 400", r.status === 400 && r.data.errors?.email);

  r = await call("/candidates", "POST", { name: "X", email: `x.${tag}@example.com`, jobTitle: "QA", stage: "Nope" });
  check("invalid stage -> 400", r.status === 400 && r.data.errors?.stage);

  r = await call("/candidates/not-an-id");
  check("malformed id -> 400", r.status === 400);

  r = await call("/candidates/507f1f77bcf86cd799439011");
  check("unknown id -> 404", r.status === 404);

  r = await call(`/candidates?search=${encodeURIComponent(`Smoke Test ${tag}`)}`);
  check("search by name finds the candidate", r.data.candidates?.length === 1);

  r = await call(`/candidates?search=${encodeURIComponent(`smoke.${tag}`)}`);
  check("search by email finds the candidate", r.data.candidates?.length === 1);

  r = await call("/candidates?search=.*");
  check("search treats input as plain text (no regex)", r.status === 200);

  r = await call(`/candidates/${id}`, "PATCH", { stage: "Interview" });
  check("PATCH stage -> Interview", r.status === 200 && r.data.candidate.stage === "Interview");

  r = await call(`/candidates?stage=Interview&search=${tag}`);
  check("stage filter + search finds the candidate", r.data.candidates?.length === 1);

  r = await call("/candidates?stage=Nope");
  check("invalid stage filter -> 400", r.status === 400);

  const mid = (await call("/dashboard/stats")).data.stats;
  check("dashboard total +1 and Interview +1",
    mid.total === before.total + 1 && mid.byStage.Interview === before.byStage.Interview + 1);

  let consistent = true;
  for (const stage of Object.keys(mid.byStage)) {
    const list = await call(`/candidates?stage=${stage}&limit=1`);
    if (list.data.pagination.total !== mid.byStage[stage]) consistent = false;
  }
  const all = await call("/candidates?limit=1");
  check("dashboard counts match the candidate list for every stage", consistent && all.data.pagination.total === mid.total);

  r = await call(`/candidates/${id}`, "DELETE");
  check("delete candidate -> 200", r.status === 200);
  id = null;

  r = await call("/candidates/507f1f77bcf86cd799439011", "DELETE");
  check("delete unknown id -> 404", r.status === 404);

  const after = (await call("/dashboard/stats")).data.stats;
  check("dashboard totals return to the original values", after.total === before.total);
} catch (error) {
  failed++;
  console.error("Smoke test could not run:", error.message);
} finally {
  if (id) await call(`/candidates/${id}`, "DELETE").catch(() => {});
}

console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
