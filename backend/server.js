import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import routes from "./src/routes.js";
import Candidate from "./src/models/candidate.js";

dotenv.config();
const app = express();
const origins = ["http://localhost:5173", ...(process.env.CLIENT_URL || "").split(",").map((url) => url.trim()).filter(Boolean)];

app.use(cors({ origin: origins }));
app.use(express.json());
app.get("/", (req, res) => res.json({ message: "HireFlow API Running" }));
app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ success: connected, status: connected ? "ok" : "degraded", db: connected ? "connected" : "disconnected" });
});
app.use("/api", routes);
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

app.use((error, req, res, next) => {
  let status = error.status || 500;
  let message = error.message || "Server error";
  if (error.type === "entity.parse.failed") status = 400;
  if (error.code === 11000) { status = 409; message = "A candidate with this email already exists"; }
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) status = 400;
  if (status === 500) console.error(error);
  res.status(status).json({ success: false, message: status === 400 && error.type === "entity.parse.failed" ? "Malformed JSON body" : message });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Candidate.init();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`MongoDB connected. Server running on ${port}`));
  } catch (error) {
    console.error("Could not start HireFlow:", error.message);
    process.exit(1);
  }
}
start();
