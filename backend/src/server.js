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
   SAFE DEBUG
========================= */
try {
  console.log("📁 ROOT:", fs.readdirSync(rootDir));
  console.log("📁 ROUTES:", fs.readdirSync(routesDir));
  console.log("📁 SERVICES:", fs.readdirSync(servicesDir));

  if (fs.existsSync(frontendDir)) {
    console.log("📁 FRONTEND:", fs.readdirSync(frontendDir));
  }
} catch (err) {
  console.error("🔥 FILE STRUCTURE ERROR:", err.message);
}

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC FRONTEND
========================= */
if (fs.existsSync(frontendDir)) {
  app.use(express.static(frontendDir));
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
   ROOT
========================= */
app.get("/", (req, res) => {
  if (fs.existsSync(path.join(frontendDir, "index.html"))) {
    return res.sendFile(path.join(frontendDir, "index.html"));
  }

  res.json({
    status: "HP TRADERS API RUNNING 🚀",
    version: "1.0.0",
  });
});

/* =========================
   DASHBOARD
========================= */
app.get("/dashboard", (req, res) => {
  const dashboardFile = path.join(frontendDir, "dashboard.html");

  if (fs.existsSync(dashboardFile)) {
    return res.sendFile(dashboardFile);
  }

  res.send("Dashboard not found");
});

/* =========================
   DERIV OAUTH CALLBACK
========================= */
app.get("/callback", async (req, res) => {
  try {
    console.log("=================================");
    console.log("🔐 DERIV CALLBACK RECEIVED");
    console.log("Query:", req.query);
    console.log("URL:", req.originalUrl);
    console.log("=================================");

    const {
      code,
      token,
      account,
      state,
      error,
      error_description,
    } = req.query;

    if (error) {
      return res.status(400).json({
        success: false,
        error,
        error_description,
      });
    }

    if (code) {
      return res.json({
        success: true,
        type: "authorization_code",
        code,
        state,
      });
    }

    if (token) {
      return res.json({
        success: true,
        type: "token",
        token,
        account,
        state,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Response missing authorization code or token",
      received: req.query,
    });
  } catch (err) {
    console.error("🔥 CALLBACK ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
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
  console.log("🔄 Deriv Market Stream Started");
} catch (err) {
  console.error("🔥 Failed to start Deriv stream:", err);
}

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("🔥 EXPRESS ERROR:", err);

  res.status(500).json({
    success: false,
    error: err.message,
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 HP TRADERS SERVER STARTED");
  console.log(`🌍 PORT: ${PORT}`);

  console.log("🔍 ENV CHECK");
  console.log(
    "DERIV_APP_ID:",
    process.env.DERIV_APP_ID ? "SET ✅" : "MISSING ❌"
  );

  console.log(
    "DERIV_API_TOKEN:",
    process.env.DERIV_API_TOKEN
      ? "SET ✅"
      : "MISSING ❌"
  );
});
