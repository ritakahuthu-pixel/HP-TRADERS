import WebSocket from "ws";

/**
 * Price subscribers (SSE clients or internal listeners)
 */
let subscribers = [];

/**
 * WebSocket instance
 */
let ws = null;

/**
 * Reconnect tracking
 */
let reconnectAttempts = 0;

/* =========================
   PUBLIC: START STREAM
========================= */
export function startDerivStream() {
  const appId = process.env.DERIV_APP_ID;

  if (!appId) {
    console.error("❌ DERIV_APP_ID missing. Stream not started.");
    return;
  }

  connect(appId);
}

/* =========================
   INTERNAL: CONNECT WS
========================= */
function connect(appId) {
  ws = new WebSocket(
    `wss://ws.derivws.com/websockets/v3?app_id=${appId}`
  );

  ws.on("open", () => {
    console.log("✅ Deriv market connected");

    reconnectAttempts = 0;

    ws.send(
      JSON.stringify({
        ticks: "R_100",
        subscribe: 1,
      })
    );
  });

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.tick?.quote) {
        broadcastPrice(msg.tick.quote);
      }
    } catch (err) {
      console.error("⚠️ Invalid tick data:", err.message);
    }
  });

  ws.on("error", (err) => {
    console.error("❌ Deriv WebSocket error:", err.message);
  });

  ws.on("close", () => {
    reconnectAttempts++;

    const delay = Math.min(1000 * reconnectAttempts, 15000);

    console.log(`⚠️ Disconnected. Reconnecting in ${delay}ms...`);

    setTimeout(() => {
      connect(appId);
    }, delay);
  });
}

/* =========================
   PUBLIC: SUBSCRIBE CLIENT
========================= */
export function addPriceSubscriber(res) {
  subscribers.push(res);
}

/* =========================
   PUBLIC: REMOVE CLIENT
========================= */
export function removePriceSubscriber(res) {
  subscribers = subscribers.filter((s) => s !== res);
}

/* =========================
   INTERNAL: BROADCAST PRICE
========================= */
function broadcastPrice(price) {
  const payload = `data: ${JSON.stringify({ price })}\n\n`;

  subscribers.forEach((res) => {
    try {
      res.write(payload);
    } catch (err) {
      removePriceSubscriber(res);
    }
  });
}
