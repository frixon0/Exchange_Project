"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = exports.BASE_CURRENCY = void 0;
const fs = __importStar(require("node:fs"));
const ReddisManager_1 = require("../ReddisManager");
const index_1 = require("../types/index");
const to_1 = require("../types/to");
const orderbook_1 = require("./orderbook");
//TODO: Avoid floats everywhere, use a decimal similar to the PayTM project for every currency
exports.BASE_CURRENCY = "INR";
class Engine {
    orderbooks = [];
    balances = new Map();
    static instance;
    constructor() {
        let snapshot = null;
        try {
            if (globalThis.process.env.WITH_SNAPSHOT) {
                snapshot = fs.readFileSync("./snapshot.json");
            }
        }
        catch (e) {
            console.log("No snapshot found");
        }
        if (snapshot) {
            const snapshotSnapshot = JSON.parse(snapshot.toString());
            this.orderbooks = snapshotSnapshot.orderbooks.map((o) => new orderbook_1.Orderbook(o.baseAsset, o.bids, o.asks, o.lastTradeId, o.currentPrice));
            this.balances = new Map(snapshotSnapshot.balances);
        }
        else {
            this.orderbooks = [new orderbook_1.Orderbook(`TATA`, [], [], 0, 0)];
            this.setBaseBalances();
        }
        setInterval(() => {
            this.saveSnapshot();
        }, 1000 * 3);
    }
    static getinstance() {
        if (!this.instance) {
            this.instance = new Engine();
        }
        return this.instance;
    }
    saveSnapshot() {
        const snapshotSnapshot = {
            orderbooks: this.orderbooks.map(o => o.getSnapshot()),
            balances: Array.from(this.balances.entries())
        };
        fs.writeFileSync("./snapshot.json", JSON.stringify(snapshotSnapshot));
    }
    process({ message, clientId }) {
        switch (message.type) {
            case to_1.CREATE_ORDER:
                try {
                    const { executedQty, fills, orderId } = this.createOrder(message.data.market, message.data.price, message.data.quantity, message.data.side, message.data.userId);
                    ReddisManager_1.RedisManager.getInstance().sendtoAPI(clientId, {
                        type: "ORDER_PLACED",
                        payload: {
                            orderId,
                            executedQty,
                            fills: fills.map(f => ({
                                price: f.price,
                                qty: f.qty,
                                tradeId: f.tradeId
                            }))
                        }
                    });
                }
                catch (e) {
                    console.log(e);
                    ReddisManager_1.RedisManager.getInstance().sendtoAPI(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId: "",
                            executedQty: 0,
                            remainingQty: 0
                        }
                    });
                }
                break;
            case to_1.CANCEL_ORDER:
                try {
                    const orderId = message.data.orderId;
                    const cancelMarket = message.data.market;
                    const cancelOrderbook = this.orderbooks.find(o => o.ticker() === cancelMarket);
                    const quoteAsset = cancelMarket.split("_")[1];
                    if (!cancelOrderbook) {
                        throw new Error("No orderbook found");
                    }
                    const order = cancelOrderbook.asks.find(o => o.orderId === orderId) || cancelOrderbook.bids.find(o => o.orderId === orderId);
                    if (!order) {
                        console.log("No order found");
                        throw new Error("No order found");
                    }
                    if (order.side === "buy") {
                        const price = cancelOrderbook.cancelBid(order);
                        const leftQuantity = (order.quantity - order.filled) * order.price;
                        //@ts-ignore
                        this.balances.get(order.userId)[exports.BASE_CURRENCY].available += leftQuantity;
                        //@ts-ignore
                        this.balances.get(order.userId)[exports.BASE_CURRENCY].locked -= leftQuantity;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    }
                    else {
                        const price = cancelOrderbook.cancelAsk(order);
                        const leftQuantity = order.quantity - order.filled;
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].available += leftQuantity;
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].locked -= leftQuantity;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    }
                    ReddisManager_1.RedisManager.getInstance().pushMessage({
                        type: index_1.ORDER_UPDATE,
                        data: {
                            orderId,
                            executedQty: 0,
                            status: "cancelled"
                        }
                    });
                    ReddisManager_1.RedisManager.getInstance().sendtoAPI(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId,
                            executedQty: 0,
                            remainingQty: 0
                        }
                    });
                }
                catch (e) {
                    console.log("Error hwile cancelling order");
                    console.log(e);
                }
                break;
            case to_1.GET_OPEN_ORDERS:
                try {
                    const openOrderbook = this.orderbooks.find(o => o.ticker() === message.data.market);
                    if (!openOrderbook) {
                        throw new Error("No orderbook found");
                    }
                    const openOrders = openOrderbook.getOpenOrders(message.data.userId);
                    ReddisManager_1.RedisManager.getInstance().sendtoAPI(clientId, {
                        type: "OPEN_ORDERS",
                        payload: openOrders.map(o => ({
                            orderId: o.orderId,
                            executedQty: o.filled,
                            price: o.price.toString(),
                            quantity: o.quantity.toString(),
                            side: o.side,
                            userId: o.userId
                        }))
                    });
                }
                catch (e) {
                    console.log(e);
                }
                break;
            case to_1.ON_RAMP:
                try {
                    const userId = message.data.userId;
                    const amount = Number(message.data.amount);
                    const { amount_updated, total_balance } = this.onRamp(userId, amount);
                    ReddisManager_1.RedisManager.getInstance().sendtoAPI(clientId, {
                        type: "ON_RAMP",
                        payload: {
                            userId: clientId,
                            amount_updated: amount_updated,
                            total_balance: total_balance
                        }
                    });
                }
                catch (e) {
                    console.log(e);
                }
                break;
            case to_1.GET_DEPTH:
                try {
                    const market = message.data.market;
                    const orderbook = this.orderbooks.find(o => o.ticker() === market);
                    if (!orderbook) {
                        throw new Error("No orderbook found");
                    }
                    ReddisManager_1.RedisManager.getInstance().sendtoAPI(clientId, {
                        type: "DEPTH",
                        payload: {
                            market,
                            ...orderbook.getDepth()
                        }
                    });
                }
                catch (e) {
                    console.log(e);
                    ReddisManager_1.RedisManager.getInstance().sendtoAPI(clientId, {
                        type: "DEPTH",
                        payload: {
                            market: message.data.market,
                            bids: [],
                            asks: []
                        }
                    });
                }
                break;
            case to_1.GET_BALANCE:
                try {
                    const userId = message.data.userId;
                    const asset = message.data.Asset;
                    const balance = this.getBalance(userId, asset);
                    ReddisManager_1.RedisManager.getInstance().sendtoAPI(clientId, {
                        type: "USER_BALANCE",
                        payload: {
                            user_balance: balance
                        }
                    });
                }
                catch (e) {
                    console.log(e);
                }
        }
    }
    getBalance(userId, asset) {
        if (this.balances.get(userId)) {
            //@ts-ignore
            const marketBalance = this.balances.get(userId)[asset]?.available || 0;
            return marketBalance;
        }
        else {
            return 0;
        }
    }
    addOrderbook(orderbook) {
        this.orderbooks.push(orderbook);
    }
    createOrder(market, price, quantity, side, userId) {
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        const baseAsset = market.split("_")[0] || "";
        const quoteAsset = market.split("_")[1] || "";
        if (!orderbook) {
            throw new Error("No orderbook found");
        }
        this.checkAndLockFunds(baseAsset, quoteAsset, side, userId, quoteAsset, price, quantity);
        const order = {
            price: Number(price),
            quantity: Number(quantity),
            orderId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            filled: 0,
            side,
            userId
        };
        const { fills, executedQty } = orderbook.addOrder(order);
        this.updateBalance(userId, baseAsset, quoteAsset, side, fills, executedQty);
        this.createDbTrades(fills, market, userId);
        this.updateDbOrders(order, executedQty, fills, market);
        this.publisWsDepthUpdates(fills, price, side, market);
        this.publishWsTrades(fills, userId, market);
        return { executedQty, fills, orderId: order.orderId };
    }
    updateDbOrders(order, executedQty, fills, market) {
        ReddisManager_1.RedisManager.getInstance().pushMessage({
            type: index_1.ORDER_UPDATE,
            data: {
                orderId: order.orderId,
                executedQty: executedQty,
                market: market,
                price: order.price.toString(),
                quantity: order.quantity.toString(),
                side: order.side,
            }
        });
        fills.forEach(fill => {
            ReddisManager_1.RedisManager.getInstance().pushMessage({
                type: index_1.ORDER_UPDATE,
                data: {
                    orderId: fill.markerOrderId,
                    executedQty: fill.qty
                }
            });
        });
    }
    createDbTrades(fills, market, userId) {
        fills.forEach(fill => {
            ReddisManager_1.RedisManager.getInstance().pushMessage({
                type: index_1.TRADE_ADDED,
                data: {
                    market: market,
                    id: fill.tradeId.toString(),
                    isBuyerMaker: fill.otherUserId === userId, // TODO: Is this right?
                    price: fill.price,
                    quantity: fill.qty.toString(),
                    quoteQuantity: (fill.qty * Number(fill.price)).toString(),
                    timestamp: Date.now()
                }
            });
        });
    }
    publishWsTrades(fills, userId, market) {
        fills.forEach(fill => {
            ReddisManager_1.RedisManager.getInstance().publishMessage(`trade@${market}`, {
                stream: `trade@${market}`,
                data: {
                    e: "trade",
                    t: fill.tradeId,
                    m: fill.otherUserId === userId, // TODO: Is this right?
                    p: fill.price,
                    q: fill.qty.toString(),
                    s: market,
                }
            });
        });
    }
    sendUpdatedDepthAt(price, market) {
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        if (!orderbook) {
            return;
        }
        const depth = orderbook.getDepth();
        const updatedBids = depth?.bids.filter(x => x[0] === price);
        const updatedAsks = depth?.asks.filter(x => x[0] === price);
        ReddisManager_1.RedisManager.getInstance().publishMessage(`depth@${market}`, {
            stream: `depth@${market}`,
            data: {
                a: updatedAsks.length ? updatedAsks : [[price, "0"]],
                b: updatedBids.length ? updatedBids : [[price, "0"]],
                e: "depth"
            }
        });
    }
    publisWsDepthUpdates(fills, price, side, market) {
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        if (!orderbook) {
            return;
        }
        const depth = orderbook.getDepth();
        if (side === "buy") {
            const updatedAsks = depth?.asks.filter(x => fills.map(f => f.price).includes(x[0].toString()));
            const updatedBid = depth?.bids.find(x => x[0] === price);
            console.log("publish ws depth updates");
            ReddisManager_1.RedisManager.getInstance().publishMessage(`depth@${market}`, {
                stream: `depth@${market}`,
                data: {
                    a: updatedAsks,
                    b: updatedBid ? [updatedBid] : [],
                    e: "depth"
                }
            });
        }
        if (side === "sell") {
            const updatedBids = depth?.bids.filter(x => fills.map(f => f.price).includes(x[0].toString()));
            const updatedAsk = depth?.asks.find(x => x[0] === price);
            console.log("publish ws depth updates");
            ReddisManager_1.RedisManager.getInstance().publishMessage(`depth@${market}`, {
                stream: `depth@${market}`,
                data: {
                    a: updatedAsk ? [updatedAsk] : [],
                    b: updatedBids,
                    e: "depth"
                }
            });
        }
    }
    updateBalance(userId, baseAsset, quoteAsset, side, fills, executedQty) {
        if (side === "buy") {
            fills.forEach(fill => {
                // Update quote asset balance
                //@ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].available = this.balances.get(fill.otherUserId)?.[quoteAsset].available + (fill.qty * fill.price);
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].locked = this.balances.get(userId)?.[quoteAsset].locked - (fill.qty * fill.price);
                // Update base asset balance
                //@ts-ignore
                this.balances.get(fill.otherUserId)[baseAsset].locked = this.balances.get(fill.otherUserId)?.[baseAsset].locked - fill.qty;
                //@ts-ignore
                this.balances.get(userId)[baseAsset].available = this.balances.get(userId)?.[baseAsset].available + fill.qty;
            });
        }
        else {
            fills.forEach(fill => {
                // Update quote asset balance
                //@ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].locked = this.balances.get(fill.otherUserId)?.[quoteAsset].locked - (fill.qty * fill.price);
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].available = this.balances.get(userId)?.[quoteAsset].available + (fill.qty * fill.price);
                // Update base asset balance
                //@ts-ignore
                this.balances.get(fill.otherUserId)[baseAsset].available = this.balances.get(fill.otherUserId)?.[baseAsset].available + fill.qty;
                //@ts-ignore
                this.balances.get(userId)[baseAsset].locked = this.balances.get(userId)?.[baseAsset].locked - (fill.qty);
            });
        }
    }
    checkAndLockFunds(baseAsset, quoteAsset, side, userId, asset, price, quantity) {
        if (side === "buy") {
            if ((this.balances.get(userId)?.[quoteAsset]?.available || 0) < Number(quantity) * Number(price)) {
                throw new Error("Insufficient funds");
            }
            //@ts-ignore
            this.balances.get(userId)[quoteAsset].available = this.balances.get(userId)?.[quoteAsset].available - (Number(quantity) * Number(price));
            //@ts-ignore
            this.balances.get(userId)[quoteAsset].locked = this.balances.get(userId)?.[quoteAsset].locked + (Number(quantity) * Number(price));
        }
        else {
            if ((this.balances.get(userId)?.[baseAsset]?.available || 0) < Number(quantity)) {
                throw new Error("Insufficient funds");
            }
            //@ts-ignore
            this.balances.get(userId)[baseAsset].available = this.balances.get(userId)?.[baseAsset].available - (Number(quantity));
            //@ts-ignore
            this.balances.get(userId)[baseAsset].locked = this.balances.get(userId)?.[baseAsset].locked + Number(quantity);
        }
    }
    onRamp(userId, amount) {
        const userBalance = this.balances.get(userId);
        if (!userBalance) {
            this.balances.set(userId, {
                [exports.BASE_CURRENCY]: {
                    available: amount,
                    locked: 0
                }
            });
        }
        else {
            //@ts-ignore
            userBalance[exports.BASE_CURRENCY].available += amount;
        }
        //@ts-ignore
        return { amount_updated: amount, total_balance: userBalance[exports.BASE_CURRENCY].available };
    }
    setBaseBalances() {
        this.balances.set("1", {
            [exports.BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "TATA": {
                available: 10000000,
                locked: 0
            }
        });
        this.balances.set("2", {
            [exports.BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "TATA": {
                available: 10000000,
                locked: 0
            }
        });
        this.balances.set("5", {
            [exports.BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "TATA": {
                available: 10000000,
                locked: 0
            }
        });
        this.balances.set("6", {
            [exports.BASE_CURRENCY]: {
                available: 100000000,
                locked: 0
            },
            "TATA": {
                available: 100000000,
                locked: 0
            }
        });
        this.balances.set("7", {
            [exports.BASE_CURRENCY]: {
                available: 100000000,
                locked: 0
            },
            "TATA": {
                available: 100000000,
                locked: 0
            }
        });
    }
}
exports.Engine = Engine;
//# sourceMappingURL=Engine.js.map