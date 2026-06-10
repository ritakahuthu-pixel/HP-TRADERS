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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: ['https://hp-traders.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// ✅ Static files FIRST — so styles.css and app.js load correctly
app.use(express.static(path.join(process.cwd(), "../frontend")));

// API routes
app.use("/api/deriv", deriv);
app.use("/api/trade", trade);
app.use("/api/bot", bot);
app.use("/api/mpesa", mpesa);
app.use("/api/ai", ai);

// Catch-all — serves index.html for any unknown route
app.get("*", (_, res) => {
  res.sendFile(path.join(process.cwd(), "../frontend", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
