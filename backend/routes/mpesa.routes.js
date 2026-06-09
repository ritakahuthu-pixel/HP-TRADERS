import express from "express";
const router = express.Router();

router.post("/pay", (req, res) => {
  res.json({ status: "mpesa payment initiated" });
});

export default router;
