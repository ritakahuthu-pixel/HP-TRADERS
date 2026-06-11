import WebSocket from "ws";

let ws;
let listeners = [];

export function startLiveMarket(app_id = 1089) {

ws = new WebSocket(
`wss://ws.derivws.com/websockets/v3?app_id=${app_id}`
);

ws.on("open", () => {
console.log("📊 Deriv Live Market Connected");

ws.send(JSON.stringify({
ticks: "R_100"   // Volatility 100 index
}));
});

ws.on("message", (data) => {

const msg = JSON.parse(data);

if(msg.tick){

const tick = {
symbol: msg.tick.symbol,
price: msg.tick.quote,
time: msg.tick.epoch
};

listeners.forEach(fn => fn(tick));

}

});

ws.on("close", () => {
console.log("❌ Market disconnected, reconnecting...");
setTimeout(() => startLiveMarket(app_id), 3000);
});

}

export function onTick(callback){
listeners.push(callback);
}
