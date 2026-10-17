import mongoose from "mongoose";

export const STAGES = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
];

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
    },

    phone: { type: String, trim: true, maxlength: 20, default: "" },

    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: 100,
    },

    resumeUrl: { type: String, trim: true, maxlength: 500, default: "" },

    stage: {
      type: String,
      enum: { values: STAGES, message: "Invalid stage: {VALUE}" },
      default: "Applied",
    },

    notes: { type: String, trim: true, maxlength: 2000, default: "" },

    appliedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);


candidateSchema.index({ stage: 1, createdAt: -1 });
candidateSchema.index({ createdAt: -1 });

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;
