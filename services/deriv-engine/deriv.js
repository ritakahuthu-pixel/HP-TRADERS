import WebSocket from "ws";

const URL = "wss://ws.derivws.com/websockets/v3";

export class DerivEngine {
  constructor(token) {
    this.token = token;
    this.ws = new WebSocket(URL);
  }

  connect() {
    this.ws.on("open", () => {
      this.ws.send(JSON.stringify({
        authorize: this.token
      }));
    });

    this.ws.on("message", (msg) => {
      const data = JSON.parse(msg);
      console.log("DERIV EVENT:", data);
    });
  }

  buy(contract) {
    this.ws.send(JSON.stringify({
      buy: 1,
      price: contract.stake,
      parameters: {
        amount: contract.stake,
        basis: "stake",
        contract_type: contract.type,
        currency: "USD",
        duration: contract.duration,
        duration_unit: "t",
        symbol: contract.symbol
      }
    }));
  }
}
