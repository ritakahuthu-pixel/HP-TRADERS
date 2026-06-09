export function runBot(engine, bot) {
  const rules = bot.rules;

  rules.forEach(rule => {
    if (rule.type === "DIGIT" && rule.condition === "EVEN") {
      engine.buy({
        type: "CALL",
        stake: bot.stake,
        duration: 5,
        symbol: bot.symbol
      });
    }

    if (rule.type === "DIGIT" && rule.condition === "ODD") {
      engine.buy({
        type: "PUT",
        stake: bot.stake,
        duration: 5,
        symbol: bot.symbol
      });
    }
  });
}
