/* =========================
   CONFIG
========================= */

const API_BASE = window.location.origin;

/* =========================
   PARTICLE BACKGROUND
========================= */

const canvas = document.getElementById("particles");

if (canvas) {
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();

  const particles = [];

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 0.7,
      dy: (Math.random() - 0.5) * 0.7
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "#00ff88";
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(0,255,136,0.15)";
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", resizeCanvas);
}

/* =========================
   DERIV OAUTH LOGIN
========================= */

function login() {
  const clientId = "33v14eEMV3YTKjPu9KNQk";

  const redirectUri = `${API_BASE}/callback`;

  const authUrl =
    `https://auth.deriv.com/oauth2/auth` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  window.location.href = authUrl;
}

function startTrading() {
  login();
}

/* =========================
   HANDLE CALLBACK
========================= */

window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  const status = document.getElementById("status");

  if (code) {
    localStorage.setItem("deriv_code", code);

    if (status) {
      status.innerText = "🟡 Logging into Deriv...";
    }

    console.log("OAuth code received:", code);
  } else {
    if (status) {
      status.innerText = "🟢 Live Market Ready";
    }
  }
});

/* =========================
   PRICE STREAM (FIXED)
========================= */

function startPriceStream() {
  const priceElement = document.getElementById("price");
  if (!priceElement) return;

  const stream = new EventSource(`${API_BASE}/api/price-stream`);

  stream.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      priceElement.innerText = Number(data.price).toFixed(2);
    } catch (err) {
      console.error("Stream parse error:", err);
    }
  };

  stream.onerror = () => {
    console.log("Price stream disconnected");
  };
}

startPriceStream();

/* =========================
   DEMO TRADING (FIXED)
========================= */

async function trade(type) {
  try {
    const response = await fetch(`${API_BASE}/api/demo/trade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        asset: "VOLATILITY",
        type,
        stake: 1
      })
    });

    const result = await response.json();

    console.log("Trade result:", result);

    alert(
      result.error
        ? result.error
        : `${type.toUpperCase()} trade executed`
    );

  } catch (err) {
    console.error("Trade error:", err);
    alert("Trade failed");
  }
}

/* =========================
   OPTIONAL: STATUS SETTER
========================= */

function setStatus(text) {
  const status = document.getElementById("status");
  if (status) status.innerText = text;
}
