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
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (fs.existsSync(frontendDir)) {
  app.use(express.static(frontendDir));
}

/* =========================
   SAFE DEBUG
========================= */
try {
  console.log("📁 ROOT:", fs.readdirSync(rootDir));
  console.log("📁 ROUTES:", fs.readdirSync(routesDir));
  console.log("📁 SERVICES:", fs.readdirSync(servicesDir));
} catch (err) {
  console.error("🔥 FILE ERROR:", err.message);
}

/* =========================
   DEMO ACCOUNT (IN-MEMORY)
========================= */
let demoAccount = {
  balance: 10000,
  currency: "USD",
  trades: []
};

/* =========================
   DEMO TRADE ENGINE
========================= */
function demoTrade({ asset, type, stake }) {
  const win = Math.random() > 0.5;
  const result = win ? "WIN" : "LOSS";
  const profit = win ? stake * 1.85 : -stake;

  demoAccount.balance += profit;

  const trade = {
    time: new Date().toISOString(),
    asset,
    type,
    stake,
    result
  };

  demoAccount.trades.unshift(trade);

  return { trade, balance: demoAccount.balance };
}

/* =========================
   API: DEMO ACCOUNT
========================= */
app.get("/api/demo/account", (req, res) => {
  res.json(demoAccount);
});

/* =========================
   API: DEMO TRADE
========================= */
app.post("/api/demo/trade", (req, res) => {
  try {
    const result = demoTrade(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   LIVE PRICE STREAM (FAKE SAFE STREAM)
   (prevents frontend breaking)
========================= */
app.get("/api/price-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");

  const interval = setInterval(() => {
    const tick = {
      price: (Math.random() * 100000).toFixed(2),
      symbol: "VOLATILITY",
      time: Date.now()
    };

    res.write(`data: ${JSON.stringify(tick)}\n\n`);
  }, 1000);

  req.on("close", () => clearInterval(interval));
});

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  const file = path.join(frontendDir, "index.html");
  if (fs.existsSync(file)) return res.sendFile(file);

  res.json({ status: "HP TRADERS RUNNING 🚀" });
});

/* =========================
   DASHBOARD
========================= */
app.get("/dashboard", (req, res) => {
  const file = path.join(frontendDir, "dashboard.html");

  if (fs.existsSync(file)) return res.sendFile(file);

  res.send("Dashboard not found");
});

/* =========================
   OPTIONAL DERIV STREAM (SAFE)
========================= */
import { startDerivStream } from "../services/derivMarket.js";

try {
  startDerivStream();
  console.log("🔄 Deriv Stream Started");
} catch (err) {
  console.log("⚠️ Deriv Stream Skipped:", err.message);
}

/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    demo_balance: demoAccount.balance
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

/* =========================
   404
========================= */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 HP TRADERS RUNNING");
  console.log("PORT:", PORT);
});
