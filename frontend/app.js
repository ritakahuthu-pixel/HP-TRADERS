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
   DERIV LOGIN
========================= */

function login() {
  const clientId = "33v14eEMV3YTKjPu9KNQk";

  const redirectUri =
    "https://hp-traders-v5ey.onrender.com/callback";

  window.location.href =
    `https://auth.deriv.com/oauth2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;
}

/* =========================
   START TRADING
========================= */

function startTrading() {
  login();
}

/* =========================
   LIVE PRICE STREAM
========================= */

function startPriceStream() {
  const priceElement = document.getElementById("price");

  if (!priceElement) return;

  const stream = new EventSource("/api/price-stream");

  stream.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      priceElement.innerHTML =
        Number(data.price).toFixed(2);
    } catch (err) {
      console.error(err);
    }
  };

  stream.onerror = () => {
    console.log("Price stream disconnected");
  };
}

startPriceStream();

/* =========================
   TRADING ACTIONS
========================= */

async function trade(type) {
  try {
    const response = await fetch("/api/trade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: 1,
        contract_type: type
      })
    });

    const result = await response.json();

    console.log(result);

    alert(
      result.error
        ? result.error
        : `${type} order submitted`
    );
  } catch (err) {
    console.error(err);
    alert("Trade failed");
  }
}

/* =========================
   DASHBOARD STATUS
========================= */

window.addEventListener("load", () => {
  const status = document.getElementById("status");

  if (status) {
    status.innerText = "🟢 Live Market Connected";
  }
});
