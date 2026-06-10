import express from "express";
import WebSocket from "ws";

const router = express.Router();

/**
 * GET /api/deriv
 * Returns account info (loginid, balance, currency, etc.)
 */
router.get("/", (req, res) => {
  try {
    const ws = new WebSocket(
      `wss://ws.derivws.com/websockets/v3?app_id=${process.env.DERIV_APP_ID}`
    );

    let responded = false;

    // timeout safety (prevents hanging requests)
    const timeout = setTimeout(() => {
      if (!responded) {
        responded = true;
        ws.close();
        return res.status(504).json({
          error: "Deriv request timeout",
        });
      }
    }, 8000);

    ws.on("open", () => {
      ws.send(
        JSON.stringify({
          authorize: process.env.DERIV_API_TOKEN,
        })
      );
    });

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());

        // SUCCESS AUTH
        if (msg.msg_type === "authorize" || msg.authorize) {
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

        // ERROR HANDLING
        if (msg.error) {
          if (!responded) {
            responded = true;
            clearTimeout(timeout);

            ws.close();

            return res.status(400).json({
              error: msg.error.message || msg.error,
            });
          }
        }
      } catch (err) {
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

    ws.on("error", (err) => {
      if (!responded) {
        responded = true;
        clearTimeout(timeout);

        return res.status(500).json({
          error: err.message,
        });
      }
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

export default router;
