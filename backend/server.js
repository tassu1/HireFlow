import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import apiRoutes from "./src/routes.js";
import Candidate from "./src/models/candidate.js";

dotenv.config();
const app = express();
const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL ];

app.use(cors({ origin: allowedOrigins,
   methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"] 
  }));

app.use(express.json());

app.get("/", (req, res) => res.json({ message: "HireFlow API Running" }));
app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ success: connected, status: connected ? "ok" : "degraded", db: connected ? "connected" : "disconnected" });
});
app.use("/api", apiRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` }));

// global error handler 
app.use((error, req, res, next) => {
  let status = error.status || 500;
  let message = error.message || "Server error";
  let errors = error.errors;
  if (error.type === "entity.parse.failed") { status = 400; message = "Malformed JSON body"; }
  if (error.code === 11000) {
    status = 409;
    const field = Object.keys(error.keyPattern || { email: 1 })[0];
    message = `A candidate with this ${field} already exists`;
    errors = { [field]: message };
  }
  if (error instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = "Validation failed";
    errors = Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]));
  }
  if (error instanceof mongoose.Error.CastError) { status = 400; message = `Invalid value for ${error.path}`; }
  if (status >= 500) {
    console.error(error);
    if (process.env.NODE_ENV === "production") message = "Server error";
  }
  res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    await Candidate.init();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`MongoDB connected. Server running on ${port}`));
  } catch (error) {
    console.error("Could not start HireFlow:", error.message);
    process.exit(1);
  }
}
start();
