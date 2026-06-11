import express from "express";
import WebSocket from "ws";

const router = express.Router();

/* =========================
   HEALTH CHECK
========================= */
router.get("/health", (req, res) => {
  res.json({
    status: "Deriv route running 🚀",
    app_id_set: !!process.env.DERIV_APP_ID,
    token_set: !!process.env.DERIV_API_TOKEN,
  });
});

/* =========================
   DEBUG CONFIG
========================= */
router.get("/debug", (req, res) => {
  res.json({
    DERIV_APP_ID: process.env.DERIV_APP_ID,
    APP_ID_LENGTH: process.env.DERIV_APP_ID?.length,
    TOKEN_SET: !!process.env.DERIV_API_TOKEN,
  });
});

/* =========================
   GET ACCOUNT INFO (FIXED)
========================= */
router.get("/", (req, res) => {
  const appId = process.env.DERIV_APP_ID;
  const token = process.env.DERIV_API_TOKEN;

  if (!appId || !token) {
    return res.status(500).json({
      error: "Missing DERIV_APP_ID or DERIV_API_TOKEN",
    });
  }

  // 🔥 DEBUG LOGS (important for Render)
  console.log("DERIV APP ID:", appId);
  console.log("DERIV WS URL:", `wss://ws.derivws.com/websockets/v3?app_id=${appId}`);

  let responded = false;

  const ws = new WebSocket(
    `wss://ws.derivws.com/websockets/v3?app_id=${appId}`
  );

  const timeout = setTimeout(() => {
    if (!responded) {
      responded = true;
      ws.terminate();
      return res.status(504).json({
        error: "Deriv request timeout (check app_id or token)",
      });
    }
  }, 10000);

  ws.on("open", () => {
    console.log("✅ WebSocket connected to Deriv");

    ws.send(
      JSON.stringify({
        authorize: token,
      })
    );
  });

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());

      console.log("📩 Deriv Response:", msg);

      /* SUCCESS */
      if (msg.msg_type === "authorize" && msg.authorize) {
        if (!responded) {
          responded = true;
          clearTimeout(timeout);
          ws.close();

          const auth = msg.authorize;

          return res.json({
            success: true,
            loginid: auth.loginid,
            balance: auth.balance,
            currency: auth.currency,
            fullname: auth.fullname,
            email: auth.email,
          });
        }
      }

      /* ERROR FROM DERIV */
      if (msg.error) {
        if (!responded) {
          responded = true;
          clearTimeout(timeout);
          ws.close();

          return res.status(400).json({
            success: false,
            error: msg.error.message,
            code: msg.error.code,
          });
        }
      }
    } catch (err) {
      console.error("Parse error:", err);

      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        ws.close();

        return res.status(500).json({
          error: "Invalid response from Deriv",
        });
      }
    }
  });

  /* CONNECTION ERROR (THIS IS WHERE YOUR 401 SHOWS) */
  ws.on("error", (err) => {
    console.error("❌ WebSocket Error:", err.message);

    if (!responded) {
      responded = true;
      clearTimeout(timeout);

      return res.status(502).json({
        success: false,
        error: "WebSocket connection failed",
        details: err.message,
      });
    }
  });

  ws.on("close", () => {
    console.log("🔌 WebSocket closed");
    clearTimeout(timeout);
  });
});

export default router;
