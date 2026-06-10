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
   GLOBAL ERROR MONITORING
========================= */

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:");
  console.error(err);
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 UNHANDLED REJECTION:");
  console.error(reason);
});

process.on("warning", (warning) => {
  console.warn("⚠️ WARNING:");
  console.warn(warning.name);
  console.warn(warning.message);
});

/* =========================
   DEBUG FILE STRUCTURE (SAFE)
========================= */

try {
  console.log("📁 CURRENT DIR FILES:", fs.readdirSync("."));
  console.log("📁 ROUTES DIR:", fs.readdirSync("../routes"));
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
   ROUTES
========================= */

app.use("/api/deriv", derivRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/bot", botRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mpesa", mpesaRoutes);

/* =========================
   HEALTH CHECK
========================= */

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    env: {
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
   START SERVER SAFELY
========================= */

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("🚀 Server running on port:", PORT);

  console.log("🔍 ENV CHECK:");
  console.log("DERIV_APP_ID:", process.env.DERIV_APP_ID ? "SET ✅" : "MISSING ❌");
  console.log("DERIV_API_TOKEN:", process.env.DERIV_API_TOKEN ? "SET ✅" : "MISSING ❌");

  try {
    startDerivStream();
  } catch (err) {
    console.error("🔥 Deriv stream failed to start:");
    console.error(err);
  }
});

/* =========================
   SERVER ERROR HANDLING
========================= */

server.on("error", (err) => {
  console.error("🔥 SERVER ERROR:");
  console.error(err);
});
