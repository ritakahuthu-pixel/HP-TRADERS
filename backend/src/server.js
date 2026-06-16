import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ROUTES
import derivRoutes from "./routes/deriv.routes.js";
import botRoutes from "./routes/bot.routes.js";

dotenv.config();

const app = express();

/* =========================
   PATH SETUP
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "../../");
const frontendDir = path.join(rootDir, "frontend");

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());

app.use(
  express.json({
    limit: "10mb"
  })
);

app.use(
  express.urlencoded({
    extended: true
  })
);

/* =========================
   STATIC FILES
========================= */
app.use(express.static(frontendDir));

/* =========================
   ROOT PAGE
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

  const trade = {
    id: Date.now(),
    time: new Date().toISOString(),
    asset,
    type,
    stake,
    result: win ? "WIN" : "LOSS",
    profit: win ? stake * 1.85 : -stake
  };

  demoAccount.balance += trade.profit;

  demoAccount.trades.unshift(trade);

  return {
    trade,
    balance: demoAccount.balance
  };
}

/* =========================
   DEMO ROUTES
========================= */

app.get("/api/demo/account", (req, res) => {
  res.json(demoAccount);
});

app.post("/api/demo/trade", (req, res) => {
  try {
    const result = demoTrade(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

/* =========================
   PRICE STREAM (DEMO)
========================= */

app.get("/api/price-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const interval = setInterval(() => {
    const tick = {
      symbol: "VOLATILITY",
      price: (Math.random() * 100000).toFixed(2),
      time: Date.now()
    };

    res.write(`data: ${JSON.stringify(tick)}\n\n`);
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
  });
});

/* =========================
   DERIV ROUTES
========================= */

app.use("/api/deriv", derivRoutes);

/* =========================
   BOT ROUTES
========================= */

app.use("/api/bots", botRoutes);

/* =========================
   HEALTH CHECK
========================= */

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    environment: process.env.NODE_ENV || "development",
    deriv_app_id: process.env.DERIV_APP_ID || "NOT SET",
    demo_balance: demoAccount.balance,
    timestamp: new Date().toISOString()
  });
});

/* =========================
   404
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    error: err.message
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("================================");
  console.log("🚀 HP TRADERS RUNNING");
  console.log(`🌐 PORT: ${PORT}`);
  console.log(`📂 FRONTEND: ${frontendDir}`);
  console.log(
    `🔑 DERIV APP ID: ${
      process.env.DERIV_APP_ID || "NOT SET"
    }`
  );
  console.log("================================");
});
