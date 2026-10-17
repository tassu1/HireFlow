# HireFlow - Mini ATS

A small recruitment dashboard for managing candidates from application to hire.

**Live app:** _add your deployed frontend URL_  
**API:** _add your deployed backend URL_ (`/api/health` should return `ok`)  
**Repository:** _add your GitHub URL_  
**Demo video:** _add your video link_

## What it does

1. See recruitment metrics on the dashboard (totals, per-stage counts, pipeline chart, recent candidates).
2. Add a candidate who applied for a position.
3. Search by name, email or job title, and filter by hiring stage.
4. Move a candidate through the pipeline: **Applied -> Screening -> Interview -> Offer -> Hired / Rejected** using the table dropdown.
5. Dashboard metrics update automatically because they are calculated from the database on every request.

Also: edit and delete candidates, server-side pagination, toasts, loading / empty / error states, responsive layout.

## Tech stack

React 19 + Vite + React Router (plain CSS) | Node.js + Express 5 | MongoDB + Mongoose

## Structure

```text
hireflow/
├── backend/
│   ├── server.js                 Express setup, MongoDB connection, error handling
│   ├── src/models/candidate.js   Candidate schema and hiring stages
│   ├── src/controllers/          Candidate operations and dashboard metrics
│   ├── src/routes.js             API routes in one place
│   └── scripts/                  Optional demo data and API smoke test
└── frontend/src/
    ├── App.jsx                   Main routes
    ├── pages/                    Dashboard and Candidates
    ├── components/               Layout, form, table, UI helpers, toast and chart
    ├── lib/                      API calls and small shared helpers
    └── styles/                   CSS for the dashboard, candidate list and layout
```

## Run locally

Needs Node 18+ and MongoDB (local or Atlas).

```bash
# backend
cd backend
cp .env.example .env        # set MONGO_URI
npm install
npm run seed                # optional sample data
npm run dev                 # http://localhost:5000

# frontend (new terminal)
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

### Verify the API end to end

With the backend running:

```bash
cd backend && npm run smoke
# against the deployed API:
API_URL=https://your-api.onrender.com/api npm run smoke
```

It creates a temporary candidate and checks create, validation errors (400), duplicate email (409), malformed/unknown ids,
search, stage filter, stage change, that dashboard counts equal the candidate list for every stage, and delete. It cleans up after itself.

## Deploy

**Backend (Render, Railway, etc.)**
1. Create a free MongoDB Atlas cluster and copy the connection string.
2. New Web Service from the `backend` folder: build `npm install`, start `npm start`.
3. Env vars: `MONGO_URI`, `CLIENT_URL` (your frontend URL, no trailing slash).
4. Check `https://<api>/api/health`.

**Frontend (Vercel, Netlify)**
1. Import the `frontend` folder (build `npm run build`, output `dist`).
2. Env var: `VITE_API_URL=https://<api>/api`.
3. `vercel.json` already rewrites all paths to `index.html` so refreshing `/candidates` works.

## API

Base path `/api`. Every response has `success`; errors look like `{ success:false, message, errors:{ field: "..." } }`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/candidates` | Create candidate |
| GET | `/candidates?search=&stage=&page=&limit=` | List, search, filter, paginate (`limit` <= 50) |
| GET | `/candidates/:id` | Fetch one |
| PATCH | `/candidates/:id` | Edit details or change stage |
| DELETE | `/candidates/:id` | Delete |
| GET | `/dashboard/stats` | Aggregated metrics |
| GET | `/health` | Liveness + DB status (503 if DB is down) |

Status codes: `201` created, `400` validation / bad id / bad query / bad JSON, `404` not found, `409` duplicate email.

## Design decisions (good interview talking points)

- **Current stage is the source of truth** - one `candidates` collection, no history collection for this scope.
- **Uniqueness lives in MongoDB** - unique index on lower-cased email; error 11000 is mapped to `409`. Race-safe, unlike check-then-insert.
- **API validation** lives beside the candidate controller; Mongoose also enforces required fields, field limits and valid stages. The frontend is never trusted on its own.
- **PATCH whitelists fields**, so clients cannot overwrite `_id` or timestamps.
- **Search is plain text** - input is regex-escaped before use, so `.*` or `(` can't break queries.
- **Metrics from an aggregation** (`$group` by stage) on the same collection the table reads; zero-count stages are included.
- **Indexes:** unique `email`, `{ stage: 1, createdAt: -1 }`, `{ createdAt: -1 }`.
- **CORS allows PATCH** (stage updates use PATCH; the default CORS method list would block them from the browser).
- **Frontend:** debounced search, stale-response protection, page reset on filter change, steps back a page if the last row is deleted.

## Not included on purpose

Authentication, email notifications, AI screening, drag-and-drop board, resume file upload (resume is a URL), audit history, background workers.

## Verification checklist

- [ ] Create a candidate
- [ ] Missing fields / invalid email rejected
- [ ] Duplicate email rejected
- [ ] Search by name and email
- [ ] Filter by stage
- [ ] Edit a candidate and change stage
- [ ] Delete a candidate; dashboard totals drop
- [ ] Dashboard counts match the table
- [ ] Empty, loading and API-failure states
- [ ] `npm run build` passes in `frontend`
- [ ] Deployed: `/api/health` ok, `npm run smoke` passes against it

## Demo video script (about 2 minutes)

Dashboard -> add a candidate (show a validation error and a duplicate-email error) -> search and stage filter -> change a stage from the table -> back to the dashboard to show updated counts -> delete a candidate -> show `/api/health`.
