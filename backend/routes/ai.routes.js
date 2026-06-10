import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    signal: "BUY",
    confidence: "82%",
    trend: "BULLISH",
    market: "Volatility 75"
  });
});

router.post("/chat", (req, res) => {
  res.json({
    status: "ai response"
  });
});

export default router;
