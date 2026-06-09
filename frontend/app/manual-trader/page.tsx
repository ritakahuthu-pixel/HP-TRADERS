"use client";

import { useState } from "react";

export default function ManualTrader() {
  const [stake, setStake] = useState(1);

  const trade = async (type: string) => {
    // ✅ works in production
await fetch("https://your-render-app.onrender.com/api/trade/buy", { {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        stake,
        duration: 5,
        symbol: "R_100"
      })
    });
  };

  return (
    <div className="p-10 text-white">
      <h1>Manual Trader</h1>

      <input
        value={stake}
        onChange={(e) => setStake(Number(e.target.value))}
        className="border p-2 text-black"
      />

      <button onClick={() => trade("CALL")}>CALL</button>
      <button onClick={() => trade("PUT")}>PUT</button>
    </div>
  );
}
