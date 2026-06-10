import express from "express";

const router = express.Router();

router.post("/deposit", (req, res) => {
  const { phone, amount } = req.body;

  res.json({
    success: true,
    phone,
    amount,
    message: "STK Push Sent"
  });
});

router.post("/withdraw", (req, res) => {
  const { phone, amount } = req.body;

  res.json({
    success: true,
    phone,
    amount,
    message: "Withdrawal Request Received"
  });
});

export default router;
