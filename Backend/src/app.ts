import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { initDB, waitForDB } from "./db";
import { loggerMiddleware } from "./middlleware/logger";
import trainRoutes from "./handlers/train";
import refreshScoreRoutes from "./handlers/refreshScore";
import healthRoutes from "./handlers/health";

const app = express();
const PORT = 3000;

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Parse JSON
app.use(bodyParser.json());

// 🔑 Initialize DB (non-blocking)
initDB();

// 🚦 Block requests until DB is ready
app.use(async (_req, res, next) => {
  try {
    await waitForDB(); // ⏳ first request waits
    next();
  } catch {
    res.status(503).json({ status: "DB warming up" });
  }
});

// Routes
app.use("/train", loggerMiddleware, trainRoutes);
app.use("/refresh-score", loggerMiddleware, refreshScoreRoutes);
app.use("/health", healthRoutes);

// Start server immediately
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
