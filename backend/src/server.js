import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import derivRoutes from "./routes/deriv.routes.js";
import tradeRoutes from "./routes/trade.routes.js";
import botRoutes from "./routes/bot.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import mpesaRoutes from "./routes/mpesa.routes.js";

import { startDerivStream } from "./services/derivMarket.js";

dotenv.config();

const app = express();

/* =========================
   GLOBAL ERROR MONITORING
========================= */

// Catches sync crashes
process.on("uncaughtException", (err) => {
  console.error("🔥 UNCUGHT EXCEPTION (server crash reason):");
  console.error(err);
  console.error(err.stack);
});

// Catches async crashes
process.on("unhandledRejection", (reason, promise) => {
  console.error("🔥 UNHANDLED PROMISE REJECTION:");
  console.error("Promise:", promise);
  console.error("Reason:", reason);
});

// WebSocket safety logs (VERY IMPORTANT for your case)
process.on("warning", (warning) => {
  console.warn("⚠️ NODE WARNING:");
  console.warn(warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   ROUTES
========================= */
app.use("/api/deriv", derivRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/bot", botRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mpesa", mpesaRoutes);

/* =========================
   HEALTH CHECK (Render)
========================= */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env_check: {
      DERIV_APP_ID: !!process.env.DERIV_APP_ID,
      DERIV_API_TOKEN: !!process.env.DERIV_API_TOKEN,
    },
  });
});

/* =========================
   STATIC FRONTEND
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../../frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/index.html"));
});

/* =========================
   SAFE SERVER START
========================= */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("🚀 Server running on port:", PORT);

  console.log("🔍 ENV CHECK:");
  console.log("DERIV_APP_ID:", process.env.DERIV_APP_ID ? "SET ✅" : "MISSING ❌");
  console.log("DERIV_API_TOKEN:", process.env.DERIV_API_TOKEN ? "SET ✅" : "MISSING ❌");

  /* =========================
     START DERIV STREAM SAFELY
  ========================= */
  try {
    startDerivStream();
  } catch (err) {
    console.error("🔥 Failed to start Deriv stream:");
    console.error(err);
  }
});

/* =========================
   SERVER ERROR HANDLING
========================= */

// Handles server-level crashes
server.on("error", (err) => {
  console.error("🔥 SERVER ERROR:");
  console.error(err);
});
