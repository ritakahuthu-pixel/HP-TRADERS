import express from "express";
import { onTick } from "../services/derivLive.js";

const router = express.Router();

router.get("/price-stream", (req, res) => {

res.setHeader("Content-Type", "text/event-stream");
res.setHeader("Cache-Control", "no-cache");

onTick((tick) => {
res.write(`data: ${JSON.stringify(tick)}\n\n`);
});

});

export default router;
