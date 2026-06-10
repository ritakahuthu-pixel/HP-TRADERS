import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const API_URL = 'https://hp-traders-xxxx.onrender.com';

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
