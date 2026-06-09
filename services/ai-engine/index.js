export function analyzeMarket(ticks) {
  const last = ticks.slice(-100);

  const up = last.filter(x => x > 5000).length;
  const down = last.length - up;

  const confidence = Math.abs(up - down) / last.length;

  return {
    signal: up > down ? "CALL" : "PUT",
    confidence: (confidence * 100).toFixed(2),
    risk: confidence > 0.7 ? "HIGH" : "LOW"
  };
}
