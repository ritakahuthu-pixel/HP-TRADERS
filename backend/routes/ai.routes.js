import express from "express";
const router = express.Router();

router.post("/chat", (req, res) => {
  res.json({ status: "ai response" });
});

export default router;
