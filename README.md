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

Also: edit and delete candidates, server-side pagination, simple status messages, loading / empty / error states, and a responsive layout.

## Tech stack

React 19 + Vite + React Router (plain CSS) | Node.js + Express 5 | MongoDB + Mongoose

## Structure

```text
hireflow/
├── README.md
├── backend/
│   ├── server.js
│   └── src/
│       ├── models/candidate.js
│       ├── controllers/       # Candidate CRUD and dashboard stats
│       └── routes.js
└── frontend/src/
    ├── App.jsx                # App layout and routes
    ├── pages/                 # Dashboard and Candidates
    ├── components/            # Candidate form and table
    ├── lib/                   # API calls and constants
    └── index.css
```

## Run locally

Needs Node 18+ and MongoDB (local or Atlas).

```bash
# backend
cd backend
cp .env.example .env        # set MONGO_URI
npm install
npm run dev                 # http://localhost:5000

# frontend (new terminal)
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```


## Deploy

**Backend (Render)**
1. Create a free MongoDB Atlas cluster and copy the connection string.
2. New Web Service from the `backend` folder: build `npm install`, start `npm start`.
3. Env vars: `MONGO_URI`, `CLIENT_URL` (your frontend URL, no trailing slash).
4. Check `https://<api>/api/health`.

**Frontend (Vercel)**
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
- [ ] Deployed: `/api/health` returns a healthy response


