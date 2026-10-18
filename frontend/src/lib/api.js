const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method || "GET",
      headers: options.body ? { "Content-Type": "application/json" } : {},
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Check your connection and try again.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

export const api = {
  listCandidates({ search = "", stage = "", page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set("search", search);
    if (stage) params.set("stage", stage);
    return request(`/candidates?${params}`);
  },
  getStats: () => request("/dashboard/stats"),
  createCandidate: (candidate) => request("/candidates", { method: "POST", body: candidate }),
  updateCandidate: (id, candidate) => request(`/candidates/${id}`, { method: "PATCH", body: candidate }),
  deleteCandidate: (id) => request(`/candidates/${id}`, { method: "DELETE" }),
};
