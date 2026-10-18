import mongoose from "mongoose";
import Candidate, { STAGES } from "../models/candidate.js";

const fields = ["name", "email", "phone", "jobTitle", "resumeUrl", "stage", "notes"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function getInput(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) fail("Request body must be an object");
  const input = {};
  fields.forEach((field) => {
    if (Object.hasOwn(body, field)) input[field] = body[field];
  });

  for (const field of ["name", "jobTitle", "email"]) {
    if (!partial || Object.hasOwn(input, field)) {
      if (typeof input[field] !== "string" || !input[field].trim()) fail(`${field} is required`);
      input[field] = input[field].trim();
    }
  }
  if (input.email && !emailPattern.test(input.email)) fail("Enter a valid email address");
  if (input.email) input.email = input.email.toLowerCase();
  if (input.stage && !STAGES.includes(input.stage)) fail("Choose a valid hiring stage");
  if (partial && !Object.keys(input).length) fail("Provide a field to update");
  return input;
}

function validId(id) {
  if (!mongoose.isValidObjectId(id) || !/^[a-f\d]{24}$/i.test(id)) fail("Invalid candidate id");
  return id;
}

export async function createCandidate(req, res) {
  const candidate = await Candidate.create(getInput(req.body));
  res.status(201).json({ success: true, candidate });
}

export async function listCandidates(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";
  const stage = req.query.stage || "";
  if (!Number.isInteger(page) || page < 1) fail("Page must be a positive integer");
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) fail("Limit must be between 1 and 50");
  if (stage && !STAGES.includes(stage)) fail("Choose a valid hiring stage");
  if (req.query.search !== undefined && typeof req.query.search !== "string") fail("Search must be text");

  const filter = {};
  if (stage) filter.stage = stage;
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: regex }, { email: regex }, { jobTitle: regex }];
  }
  const [candidates, total] = await Promise.all([
    Candidate.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Candidate.countDocuments(filter),
  ]);
  res.json({ success: true, candidates, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
}

export async function getCandidate(req, res) {
  const candidate = await Candidate.findById(validId(req.params.id));
  if (!candidate) fail("Candidate not found", 404);
  res.json({ success: true, candidate });
}

export async function updateCandidate(req, res) {
  const candidate = await Candidate.findByIdAndUpdate(validId(req.params.id), { $set: getInput(req.body, true) }, { new: true, runValidators: true });
  if (!candidate) fail("Candidate not found", 404);
  res.json({ success: true, candidate });
}

export async function deleteCandidate(req, res) {
  const candidate = await Candidate.findByIdAndDelete(validId(req.params.id));
  if (!candidate) fail("Candidate not found", 404);
  res.json({ success: true, message: "Candidate deleted" });
}
