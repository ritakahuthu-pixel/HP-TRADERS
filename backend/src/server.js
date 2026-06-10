import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import deriv from "../routes/deriv.routes.js";
import trade from "../routes/trade.routes.js";
import bot from "../routes/bot.routes.js";
import mpesa from "../routes/mpesa.routes.js";
import ai from "../routes/ai.routes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ FIXED FRONTEND PATH (absolute-safe)
const frontendPath = path.resolve(__dirname, "../../frontend");

app.use(cors({
  origin: [
    "https://hp-traders.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use(express.json());

// ✅ Serve frontend correctly
app.use(express.static(frontendPath));

// API routes
app.use("/api/deriv", deriv);
app.use("/api/trade", trade);
app.use("/api/bot", bot);
app.use("/api/mpesa", mpesa);
app.use("/api/ai", ai);

// ✅ SPA fallback (safe)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
