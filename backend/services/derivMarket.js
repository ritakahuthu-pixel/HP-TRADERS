import WebSocket from "ws";

let subscribers = [];
let ws = null;
let reconnectAttempts = 0;
let reconnectTimer = null;

/**
 * Start Deriv Market Stream
 */
export function startDerivStream() {
  const appId = process.env.DERIV_APP_ID;

  if (!appId) {
    console.error("❌ DERIV_APP_ID is missing");
    return;
  }

  // Prevent duplicate connections
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log("ℹ️ Deriv stream already running");
    return;
  }

  connect(appId);
}

/**
 * Connect to Deriv
 */
function connect(appId) {
  console.log("🔄 Connecting to Deriv...");

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

      // Deriv API error
      if (msg.error) {
        console.error("❌ Deriv API Error:", msg.error);
        return;
      }

      if (msg.tick?.quote) {
        broadcastPrice(msg.tick.quote);
      }
    } catch (err) {
      console.error("❌ Tick parse error:", err.message);
    }
  });

  ws.on("error", (err) => {
    console.error("❌ WebSocket Error:", err.message);
  });

  ws.on("close", (code, reason) => {
    console.warn(
      `⚠️ Deriv disconnected | Code: ${code} | Reason: ${reason}`
    );

    reconnectAttempts++;

    const delay = Math.min(
      reconnectAttempts * 1000,
      15000
    );

    console.log(`🔄 Reconnecting in ${delay}ms`);

    clearTimeout(reconnectTimer);

    reconnectTimer = setTimeout(() => {
      connect(appId);
    }, delay);
  });
}

/**
 * Add SSE client
 */
export function addPriceSubscriber(res) {
  subscribers.push(res);

  console.log(
    `📈 Subscriber connected (${subscribers.length})`
  );
}

/**
 * Remove SSE client
 */
export function removePriceSubscriber(res) {
  subscribers = subscribers.filter(
    (client) => client !== res
  );

  console.log(
    `📉 Subscriber removed (${subscribers.length})`
  );
}

/**
 * Broadcast tick price
 */
function broadcastPrice(price) {
  const payload = `data: ${JSON.stringify({
    price,
    timestamp: Date.now(),
  })}\n\n`;

  subscribers.forEach((res) => {
    try {
      res.write(payload);
    } catch (err) {
      removePriceSubscriber(res);
    }
  });
}
