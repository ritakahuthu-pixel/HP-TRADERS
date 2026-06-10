import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import WebSocket from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(process.cwd(), "../frontend")));
app.get("*", (_, res) => {
  res.sendFile(path.join(process.cwd(), "../frontend", "index.html"));
});

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let userToken = null;
let priceClients = [];

/* =========================
   DERIV MARKET STREAM
========================= */
const ws = new WebSocket(
  `wss://ws.derivws.com/websockets/v3?app_id=${process.env.DERIV_APP_ID}`
);

ws.on("open", () => {
  console.log("✅ Connected to Deriv market");

  ws.send(JSON.stringify({
    ticks: "R_100",
    subscribe: 1
  }));
});

ws.on("message", (data) => {
  const msg = JSON.parse(data);

  if (msg.tick) {
    const price = msg.tick.quote;

    priceClients.forEach(fn => fn(price));
  }
});

/* =========================
   PRICE STREAM (FRONTEND)
========================= */
app.get("/api/price-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");

  const send = (price) => {
    res.write(`data: ${JSON.stringify({ price })}\n\n`);
  };

  priceClients.push(send);

  req.on("close", () => {
    priceClients = priceClients.filter(f => f !== send);
  });
});

/* =========================
   OAUTH CALLBACK
========================= */
app.get("/callback", async (req, res) => {
  const { code, state } = req.query;

  const response = await fetch("https://auth.deriv.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.DERIV_CLIENT_ID,
      code,
      code_verifier: state,
      redirect_uri: process.env.REDIRECT_URI
    })
  });

  const data = await response.json();
  userToken = data.access_token;

  res.send("Login successful ✔ You can close this tab.");
});

/* =========================
   REAL TRADE EXECUTION
========================= */
app.post("/api/trade", async (req, res) => {
  if (!userToken) {
    return res.json({ error: "User not logged in" });
  }

  const { amount, contract_type } = req.body;

  const response = await fetch(
    "https://api.derivws.com/trading/v1/buy",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        price: amount,
        parameters: {
          amount,
          basis: "stake",
          contract_type,
          currency: "USD",
          duration: 5,
          duration_unit: "t",
          symbol: "R_100"
        }
      })
    }
  );

  const data = await response.json();
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🚀 IQ Engine running on", PORT));
