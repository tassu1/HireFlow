import dotenv from "dotenv";
import mongoose from "mongoose";
import Candidate from "../src/models/candidate.js";

dotenv.config();

const DAY = 86400000;
const people = [
  ["Aarav Sharma", "Backend Developer", "Applied"],
  ["Priya Nair", "Frontend Developer", "Screening"],
  ["Rohan Mehta", "Full Stack Developer", "Interview"],
  ["Ananya Iyer", "Product Designer", "Offer"],
  ["Kabir Singh", "DevOps Engineer", "Hired"],
  ["Sneha Kulkarni", "QA Engineer", "Rejected"],
  ["Vikram Rao", "Backend Developer", "Interview"],
  ["Meera Joshi", "Data Analyst", "Screening"],
  ["Arjun Patel", "Full Stack Developer", "Applied"],
  ["Isha Verma", "Recruiter", "Hired"],
  ["Dev Malhotra", "Backend Developer", "Applied"],
  ["Tara Bose", "Frontend Developer", "Offer"],
];

await mongoose.connect(process.env.MONGO_URI);
await Candidate.init();
await Candidate.deleteMany({});

await Candidate.insertMany(
  people.map(([name, jobTitle, stage], i) => ({
    name,
    jobTitle,
    stage,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
    phone: `98765${43210 + i}`,
    appliedAt: new Date(Date.now() - i * DAY),
    createdAt: new Date(Date.now() - i * DAY),
  }))
);

console.log(`Seeded ${people.length} candidates`);
await mongoose.disconnect();
