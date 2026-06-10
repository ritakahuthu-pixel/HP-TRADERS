import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    account: "Demo Account",
    balance: 12450,
    currency: "USD",
    marketStatus: "LIVE"
  });
});

export default router;
