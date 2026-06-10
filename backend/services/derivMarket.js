iimport WebSocket from "ws";

let subscribers = [];
let ws = null;
let reconnectAttempts = 0;

/**
 * Start Deriv Market Stream
 */
export function startDerivStream() {
  const appId = process.env.DERIV_APP_ID;

  if (!appId) {
    console.error("❌ DERIV_APP_ID missing");
    return;
  }

  connect(appId);
}

/**
 * Connect to Deriv
 */
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
      console.error("Tick parse error:", err.message);
    }
  });

  ws.on("error", (err) => {
    console.error("❌ WebSocket Error:", err.message);
  });

  ws.on("close", () => {
    reconnectAttempts++;

    const delay = Math.min(
      reconnectAttempts * 1000,
      15000
    );

    console.log(
      `⚠️ Reconnecting in ${delay}ms`
    );

    setTimeout(() => {
      connect(appId);
    }, delay);
  });
}

/**
 * Add SSE client
 */
export function addPriceSubscriber(res) {
  subscribers.push(res);
}

/**
 * Remove SSE client
 */
export function removePriceSubscriber(res) {
  subscribers = subscribers.filter(
    (s) => s !== res
  );
}

/**
 * Broadcast tick
 */
function broadcastPrice(price) {
  const payload =
    `data: ${JSON.stringify({ price })}\n\n`;

  subscribers.forEach((res) => {
    try {
      res.write(payload);
    } catch {
      removePriceSubscriber(res);
    }
  });
}
