import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import WebSocket from "ws";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// DERIV WEB SOCKET CONNECTION
// ============================
const DERIV_WS = "wss://ws.derivws.com/websockets/v3?app_id=" + process.env.DERIV_APP_ID;

let ws;
let priceSubscribers = [];

function connectDeriv() {
  ws = new WebSocket(DERIV_WS);

  ws.on("open", () => {
    console.log("✅ Connected to Deriv");

    // subscribe to market
    ws.send(JSON.stringify({
      ticks: "R_100",
      subscribe: 1
    }));
  });

  ws.on("message", (data) => {
    const msg = JSON.parse(data);

    if (msg.tick) {
      const price = msg.tick.quote;

      // broadcast to frontend clients
      priceSubscribers.forEach(fn => fn(price));
    }
  });

  ws.on("close", () => {
    console.log("❌ Deriv disconnected, reconnecting...");
    setTimeout(connectDeriv, 3000);
  });
}

connectDeriv();

// ============================
// API: LIVE PRICE STREAM
// ============================
app.get("/api/price-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");

  const send = (price) => {
    res.write(`data: ${JSON.stringify({ price })}\n\n`);
  };

  priceSubscribers.push(send);

  req.on("close", () => {
    priceSubscribers = priceSubscribers.filter(fn => fn !== send);
  });
});

// ============================
// API: PLACE TRADE
// ============================
app.post("/api/trade", (req, res) => {
  const { amount, contract_type } = req.body;

  const payload = {
    buy: 1,
    price: amount,
    parameters: {
      amount,
      basis: "stake",
      contract_type, // CALL or PUT
      currency: "USD",
      duration: 5,
      duration_unit: "t",
      symbol: "R_100"
    }
  };

  ws.send(JSON.stringify(payload));

  res.json({
    success: true,
    message: "Trade sent to Deriv"
  });
});

// ============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🚀 Trading server running on port", PORT);
});
