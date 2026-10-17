export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Thin fetch wrapper: prefixes API_URL, sends JSON, and normalizes errors so
 * callers get parsed JSON back or a thrown ApiError with a readable message
 * (and per-field messages from the server, if any).
 */
async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the server. Check your connection and try again.",
      0
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      (data && data.message) || `Request failed (${res.status})`,
      res.status,
      (data && data.errors) || {}
    );
  }

  return data;
}

export const api = {
  // candidates
  listCandidates: ({ search, stage, page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (stage) params.set("stage", stage);
    params.set("page", String(page));
    params.set("limit", String(limit));
    return request(`/candidates?${params}`);
  },
  getCandidate: (id) => request(`/candidates/${id}`),
  createCandidate: (payload) =>
    request("/candidates", { method: "POST", body: payload }),
  updateCandidate: (id, payload) =>
    request(`/candidates/${id}`, { method: "PATCH", body: payload }),
  deleteCandidate: (id) => request(`/candidates/${id}`, { method: "DELETE" }),

  // dashboard
  getStats: () => request("/dashboard/stats"),
};
