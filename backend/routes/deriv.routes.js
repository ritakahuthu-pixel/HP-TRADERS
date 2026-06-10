import express from "express";
import WebSocket from "ws";

const router = express.Router();

router.get("/", (req, res) => {
  const appId = process.env.DERIV_APP_ID;
  const token = process.env.DERIV_API_TOKEN;

  // ❌ prevent invalid config crash
  if (!appId || !token) {
    return res.status(500).json({
      error: "Missing DERIV_APP_ID or DERIV_API_TOKEN in environment variables",
    });
  }

  let responded = false;

  const ws = new WebSocket(
    `wss://ws.derivws.com/websockets/v3?app_id=${appId}`
  );

  const timeout = setTimeout(() => {
    if (!responded) {
      responded = true;
      ws.terminate();
      return res.status(504).json({ error: "Deriv request timeout" });
    }
  }, 8000);

  ws.on("open", () => {
    ws.send(
      JSON.stringify({
        authorize: token,
      })
    );
  });

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.msg_type === "authorize" && msg.authorize) {
        if (!responded) {
          responded = true;
          clearTimeout(timeout);
          ws.close();

          const auth = msg.authorize;

          return res.json({
            loginid: auth.loginid,
            balance: auth.balance,
            currency: auth.currency,
            fullname: auth.fullname,
            email: auth.email,
          });
        }
      }

      if (msg.error) {
        if (!responded) {
          responded = true;
          clearTimeout(timeout);
          ws.close();

          return res.status(400).json({
            error: msg.error.message,
          });
        }
      }
    } catch (err) {
      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        ws.close();

        return res.status(500).json({
          error: "Invalid Deriv response",
        });
      }
    }
  });

  // 🔥 CRITICAL FIX: prevent crash
  ws.on("error", (err) => {
    if (!responded) {
      responded = true;
      clearTimeout(timeout);

      return res.status(502).json({
        error: "WebSocket connection failed",
        details: err.message,
      });
    }
  });

  ws.on("close", () => {
    clearTimeout(timeout);
  });
});

export default router;
