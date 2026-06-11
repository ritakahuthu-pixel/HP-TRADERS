import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

/* =========================
   PATH SETUP (FIXED)
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANT FIX: go up TWO levels (backend/src → project root)
const rootDir = path.join(__dirname, "../../");
const frontendDir = path.join(rootDir, "frontend");

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend (CSS/JS/images)
app.use(express.static(frontendDir));

/* =========================
   ROOT → INDEX.HTML (FIXED)
========================= */
app.get("/", (req, res) => {
  const file = path.join(frontendDir, "index.html");

  if (fs.existsSync(file)) {
    return res.sendFile(file);
  }

  return res.status(404).json({
    error: "index.html not found",
    expectedPath: file
  });
});

/* =========================
   DEMO ACCOUNT
========================= */
let demoAccount = {
  balance: 10000,
  currency: "USD",
  trades: []
};

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
   API ROUTES
========================= */
app.get("/api/demo/account", (req, res) => {
  res.json(demoAccount);
});

app.post("/api/demo/trade", (req, res) => {
  try {
    const result = demoTrade(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   PRICE STREAM (SSE)
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
   HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    balance: demoAccount.balance
  });
});

/* =========================
   404 HANDLER
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
