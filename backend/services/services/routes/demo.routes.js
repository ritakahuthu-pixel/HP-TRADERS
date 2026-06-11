import express from "express";
import { trade, getAccount } from "../services/demoTrade.js";

const router = express.Router();

/* TRADE */
router.post("/trade", (req, res) => {
const result = trade(req.body);
res.json(result);
});

/* ACCOUNT */
router.get("/account", (req, res) => {
res.json(getAccount());
});

export default router;
