import express, { NextFunction, type ErrorRequestHandler } from "express";
import cors from "cors";
import { pool } from "./db.js";
import { vendorsRouter } from "./routes/vendors.js";
import { assessmentsRouter } from "./routes/assessments.js";

const app = express();

// Allowed frontend origins.
const allowedOrigins = (
  process.env.FRONTEND_ORIGINS ??
  "http://localhost:5173,https://robertns021.github.io"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Configure CORS.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header,
      // such as local command-line API tests.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
  })
);

// Parse incoming JSON requests.
app.use(express.json({ limit: "100kb" }));

// Health check endpoint.
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "vendorlens-api",
    timestamp: new Date().toISOString(),
  });
});

// Database connectivity check.
app.get("/api/health/db", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      database: "connected",
      service: "vendorlens-api",
    });
  } catch (error) {
    next(error);
  }
});

//Routes
app.use("/api/vendors", vendorsRouter);
app.use("/api/assessments", assessmentsRouter);

// Handle unknown routes.
app.use((_req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Central error handler.
const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error("API error:", error);

  res.status(500).json({
    error: "Internal server error",
  });
};

app.use(errorHandler);

export default app;
