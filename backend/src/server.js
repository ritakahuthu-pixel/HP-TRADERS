import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import deriv from "../routes/deriv.routes.js";
import trade from "../routes/trade.routes.js";
import bot from "../routes/bot.routes.js";
import mpesa from "../routes/mpesa.routes.js";
import ai from "../routes/ai.routes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'https://hp-traders.vercel.app',
    'https://hp-traders-ivy7.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use("/api/deriv", deriv);
app.use("/api/trade", trade);
app.use("/api/bot", bot);
app.use("/api/mpesa", mpesa);
app.use("/api/ai", ai);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
