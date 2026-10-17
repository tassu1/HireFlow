import mongoose from "mongoose";
import Candidate, { STAGES } from "../models/candidate.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const allowedFields = ["name", "email", "phone", "jobTitle", "resumeUrl", "stage", "notes"];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function badRequest(message, errors = {}) {
  const error = new Error(message);
  error.status = 400;
  error.errors = errors;
  throw error;
}

function candidateInput(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    badRequest("Request body must be a JSON object");
  }

  const data = {};
  for (const field of allowedFields) {
    if (Object.hasOwn(body, field)) data[field] = body[field];
  }

  const errors = {};
  for (const field of ["name", "jobTitle", "email"]) {
    if (!partial || Object.hasOwn(data, field)) {
      const value = data[field];
      if (typeof value !== "string" || !value.trim()) {
        errors[field] = `${field === "jobTitle" ? "Job title" : field[0].toUpperCase() + field.slice(1)} is required`;
      } else {
        data[field] = value.trim();
      }
    }
  }

  if (data.email && !emailPattern.test(data.email)) errors.email = "Enter a valid email address";
  if (data.email) data.email = data.email.toLowerCase();
  if (data.stage !== undefined && !STAGES.includes(data.stage)) errors.stage = "Choose a valid hiring stage";
  if (data.resumeUrl && !/^https?:\/\//i.test(data.resumeUrl)) errors.resumeUrl = "Resume URL must start with http:// or https://";
  if (data.phone !== undefined && data.phone !== "" && !/^[+]?[-\d\s().]{6,20}$/.test(data.phone)) errors.phone = "Enter a valid phone number";
  if (data.notes !== undefined && typeof data.notes !== "string") errors.notes = "Notes must be text";
  if (Object.keys(errors).length) badRequest("Please check the candidate details", errors);
  if (partial && Object.keys(data).length === 0) badRequest("Provide at least one field to update");
  return data;
}

function validId(id) {
  if (!mongoose.isValidObjectId(id) || !/^[a-f\d]{24}$/i.test(id)) badRequest("Invalid candidate id");
  return id;
}

export async function createCandidate(req, res) {
  const candidate = await Candidate.create(candidateInput(req.body));
  res.status(201).json({ success: true, candidate });
}

export async function listCandidates(req, res) {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";
  const stage = req.query.stage || "";

  if (!Number.isInteger(page) || page < 1) badRequest("Page must be a positive integer", { page: "Invalid page" });
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) badRequest("Limit must be between 1 and 50", { limit: "Invalid limit" });
  if (stage && !STAGES.includes(stage)) badRequest("Choose a valid hiring stage", { stage: "Invalid stage" });
  if (req.query.search !== undefined && typeof req.query.search !== "string") badRequest("Search must be text");

  const filter = {};
  if (stage) filter.stage = stage;
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: regex }, { email: regex }, { jobTitle: regex }];
  }

  const [candidates, total] = await Promise.all([
    Candidate.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Candidate.countDocuments(filter),
  ]);
  res.json({
    success: true,
    candidates,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}

export async function getCandidate(req, res) {
  const candidate = await Candidate.findById(validId(req.params.id));
  if (!candidate) {
    const error = new Error("Candidate not found");
    error.status = 404;
    throw error;
  }
  res.json({ success: true, candidate });
}

export async function updateCandidate(req, res) {
  const updates = candidateInput(req.body, true);
  const candidate = await Candidate.findByIdAndUpdate(validId(req.params.id), { $set: updates }, { new: true, runValidators: true });
  if (!candidate) {
    const error = new Error("Candidate not found");
    error.status = 404;
    throw error;
  }
  res.json({ success: true, candidate });
}

export async function deleteCandidate(req, res) {
  const candidate = await Candidate.findByIdAndDelete(validId(req.params.id));
  if (!candidate) {
    const error = new Error("Candidate not found");
    error.status = 404;
    throw error;
  }
  res.json({ success: true, message: "Candidate deleted" });
}
