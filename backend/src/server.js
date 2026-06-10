import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

/* =========================
   PATH RESOLUTION (SAFE)
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "..");
const routesDir = path.join(rootDir, "routes");
const servicesDir = path.join(rootDir, "services");

/* =========================
   GLOBAL ERROR HANDLERS
========================= */
process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:");
  console.error(err.stack || err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 UNHANDLED REJECTION:");
  console.error(err.stack || err);
});

/* =========================
   FILE DEBUG (SAFE)
========================= */
try {
  console.log("📁 ROOT DIR:", fs.readdirSync(rootDir));
  console.log("📁 ROUTES:", fs.readdirSync(routesDir));
  console.log("📁 SERVICES:", fs.readdirSync(servicesDir));
} catch (err) {
  console.error("🔥 FILE STRUCTURE ERROR:");
  console.error(err.message);
}

/* =========================
   IMPORT ROUTES
========================= */
import derivRoutes from "../routes/deriv.routes.js";
import tradeRoutes from "../routes/trade.routes.js";
import botRoutes from "../routes/bot.routes.js";
import aiRoutes from "../routes/ai.routes.js";
import mpesaRoutes from "../routes/mpesa.routes.js";

/* =========================
   IMPORT SERVICES
========================= */
import { startDerivStream } from "../services/derivMarket.js";

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
   HEALTH CHECK
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
   START DERIV STREAM (SAFE)
========================= */
try {
  startDerivStream();
  console.log("🔄 Deriv stream initializing...");
} catch (err) {
  console.error("🔥 Failed to start Deriv stream:");
  console.error(err.stack || err);
}

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("🚀 Server running on port:", PORT);

  console.log("🔍 ENV CHECK:");
  console.log(
    "DERIV_APP_ID:",
    process.env.DERIV_APP_ID ? "SET ✅" : "MISSING ❌"
  );

  console.log(
    "DERIV_API_TOKEN:",
    process.env.DERIV_API_TOKEN ? "SET ⚠️ (DO NOT EXPOSE)" : "MISSING ❌"
  );
});

/* =========================
   SERVER ERROR HANDLING
========================= */
server.on("error", (err) => {
  console.error("🔥 SERVER ERROR:");
  console.error(err);
});
