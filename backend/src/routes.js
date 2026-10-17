import { Router } from "express";
import { createCandidate, listCandidates, getCandidate, updateCandidate, deleteCandidate } from "./controllers/candidate.js";
import { getStats } from "./controllers/dashboard.js";

const router = Router();
router.get("/dashboard/stats", getStats);
router.route("/candidates").get(listCandidates).post(createCandidate);
router.route("/candidates/:id").get(getCandidate).patch(updateCandidate).delete(deleteCandidate);
export default router;
