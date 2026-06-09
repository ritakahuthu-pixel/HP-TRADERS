import express from "express";
// ✅ correct
import { DerivEngine } from "../../services/deriv-engine/deriv.js";

const router = express.Router();

let engine;

router.post("/connect", (req, res) => {
  engine = new DerivEngine(req.body.token);
  engine.connect();

  res.json({ status: "connected" });
});

router.post("/buy", (req, res) => {
  engine.buy(req.body);
  res.json({ status: "trade_sent" });
});

export default router;
