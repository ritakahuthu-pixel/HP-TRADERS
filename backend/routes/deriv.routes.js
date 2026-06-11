router.get("/", (req, res) => {
  const appId = process.env.DERIV_APP_ID;
  const token = process.env.DERIV_API_TOKEN;

  if (!appId || !token) {
    return res.status(500).json({
      error: "Missing DERIV_APP_ID or DERIV_API_TOKEN",
    });
  }

  const ws = new WebSocket(
    `wss://ws.derivws.com/websockets/v3?app_id=${appId}`
  );

  let responded = false;

  const timeout = setTimeout(() => {
    if (!responded) {
      responded = true;
      ws.terminate();
      return res.status(504).json({
        error: "Deriv timeout",
      });
    }
  }, 10000);

  ws.on("open", () => {
    ws.send(JSON.stringify({
      authorize: token
    }));
  });

  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    // SUCCESS
    if (msg.authorize) {
      responded = true;
      clearTimeout(timeout);
      ws.close();

      return res.json({
        success: true,
        loginid: msg.authorize.loginid,
        balance: msg.authorize.balance,
        currency: msg.authorize.currency,
        fullname: msg.authorize.fullname,
        email: msg.authorize.email
      });
    }

    // ERROR
    if (msg.error) {
      responded = true;
      clearTimeout(timeout);
      ws.close();

      return res.status(400).json({
        success: false,
        error: msg.error.message
      });
    }
  });

  ws.on("error", (err) => {
    if (!responded) {
      responded = true;
      clearTimeout(timeout);

      return res.status(502).json({
        error: err.message
      });
    }
  });
});
