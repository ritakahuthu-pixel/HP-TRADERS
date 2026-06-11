let account = {
balance: 10000,
currency: "USD",
trades: []
};

export function getAccount(){
return account;
}

export function trade({ asset, type, stake }){

const win = Math.random() > 0.5;

const result = win ? "WIN" : "LOSS";
const profit = win ? stake * 1.85 : -stake;

account.balance += profit;

const trade = {
time: new Date().toISOString(),
asset,
type,
stake,
result
};

account.trades.unshift(trade);

return { trade, balance: account.balance };
}
