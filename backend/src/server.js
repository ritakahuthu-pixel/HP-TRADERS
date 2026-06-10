import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import derivRoutes from "../routes/deriv.routes.js";
import tradeRoutes from "../routes/trade.routes.js";
import botRoutes from "../routes/bot.routes.js";
import aiRoutes from "../routes/ai.routes.js";
import mpesaRoutes from "../routes/mpesa.routes.js";

import { startDerivStream } from "../services/derivMarket.js";

dotenv.config();

const app = express();

/* =========================
   GLOBAL ERROR HANDLERS
========================= */

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:");
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 UNHANDLED REJECTION:");
  console.error(err);
});

/* =========================
   DEBUG FILE STRUCTURE (SAFE)
========================= */

try {
  console.log("📁 ROOT:", fs.readdirSync("."));
  console.log("📁 ROUTES:", fs.readdirSync("./routes"));
  console.log("📁 SERVICES:", fs.readdirSync("./services"));
} catch (err) {
  console.error("🔥 FILE STRUCTURE ERROR:");
  console.error(err.message);
}

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());

/* =========================
   API ROUTES
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
    env: {
      DERIV_APP_ID: !!process.env.DERIV_APP_ID,
      DERIV_API_TOKEN: !!process.env.DERIV_API_TOKEN,
    },
  });
});

/* =========================
   START DERIV STREAM SAFELY
========================= */

try {
  startDerivStream();
} catch (err) {
  console.error("🔥 Failed to start Deriv stream:");
  console.error(err);
}

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("🚀 Server running on port:", PORT);

  console.log("🔍 ENV CHECK:");
  console.log("DERIV_APP_ID:", process.env.DERIV_APP_ID ? "SET ✅" : "MISSING ❌");
  console.log("DERIV_API_TOKEN:", process.env.DERIV_API_TOKEN ? "SET ✅" : "MISSING ❌");
});

/* =========================
   SERVER ERROR HANDLING
========================= */

server.on("error", (err) => {
  console.error("🔥 SERVER ERROR:");
  console.error(err);
});
