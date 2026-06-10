import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

/* =========================
   PATH SETUP
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "..");
const frontendDir = path.join(rootDir, "frontend");
const routesDir = path.join(rootDir, "routes");
const servicesDir = path.join(rootDir, "services");

/* =========================
   GLOBAL ERROR HANDLERS
========================= */
process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 UNHANDLED REJECTION:", err);
});

/* =========================
   SAFE DEBUG (OPTIONAL)
   REMOVE IN PRODUCTION LATER
========================= */
try {
  console.log("📁 ROOT:", fs.readdirSync(rootDir));
  console.log("📁 ROUTES:", fs.readdirSync(routesDir));
  console.log("📁 SERVICES:", fs.readdirSync(servicesDir));
  console.log("📁 FRONTEND:", fs.readdirSync(frontendDir));
} catch (err) {
  console.error("🔥 FILE STRUCTURE ERROR:", err.message);
}

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   STATIC FRONTEND (IMPORTANT)
========================= */
app.use(express.static(frontendDir));

/* =========================
   IMPORT ROUTES
========================= */
import derivRoutes from "../routes/deriv.routes.js";
import tradeRoutes from "../routes/trade.routes.js";
import botRoutes from "../routes/bot.routes.js";
import aiRoutes from "../routes/ai.routes.js";
import mpesaRoutes from "../routes/mpesa.routes.js";

/* =========================
   SERVICES
========================= */
import { startDerivStream } from "../services/derivMarket.js";

/* =========================
   API ROUTES
========================= */
app.use("/api/deriv", derivRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/bot", botRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mpesa", mpesaRoutes);

/* =========================
   FRONTEND ROUTES
========================= */

// Landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

// Dashboard page
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(frontendDir, "dashboard.html"));
});

/* =========================
   CALLBACK ROUTE (DERIV OAUTH)
========================= */
app.get("/callback", (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  return res.send(`
    <html>
      <body style="background:#041122;color:white;text-align:center;padding:50px">
        <h1>Login Successful 🚀</h1>
        <p>Deriv authentication completed.</p>
        <a href="/dashboard" style="color:#00ff88">Go to Dashboard</a>
      </body>
    </html>
  `);
});

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
   START DERIV STREAM
========================= */
try {
  startDerivStream();
  console.log("🔄 Deriv stream initializing...");
} catch (err) {
  console.error("🔥 Failed to start Deriv stream:", err);
}

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port:", PORT);

  console.log("🔍 ENV CHECK:");
  console.log("DERIV_APP_ID:", process.env.DERIV_APP_ID ? "SET ✅" : "MISSING ❌");
  console.log("DERIV_API_TOKEN:", process.env.DERIV_API_TOKEN ? "SET ⚠️ (DO NOT EXPOSE)" : "MISSING ❌");
});
