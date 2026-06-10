import express from "express";
import WebSocket from "ws";

const router = express.Router();

router.get("/", async (req, res) => {
  try {

    const ws = new WebSocket(
      `wss://ws.derivws.com/websockets/v3?app_id=${process.env.DERIV_APP_ID}`
    );

    ws.on("open", () => {

      ws.send(JSON.stringify({
        authorize: process.env.DERIV_API_TOKEN
      }));

    });

    ws.on("message", (data) => {

      const msg = JSON.parse(data);

      if (msg.authorize) {

        res.json({
          loginid: msg.authorize.loginid,
          balance: msg.authorize.balance,
          currency: msg.authorize.currency,
          fullname: msg.authorize.fullname,
          email: msg.authorize.email
        });

        ws.close();
      }

      if (msg.error) {

        res.status(500).json(msg.error);

        ws.close();
      }

    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});

export default router;
