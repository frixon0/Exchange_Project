"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orderbook = void 0;
const Engine_1 = require("./Engine");
class Orderbook {
    bids;
    asks;
    baseAsset;
    quoteAsset = Engine_1.BASE_CURRENCY;
    lastTradeId;
    currentPrice;
    constructor(baseAsset, bids, asks, lastTradeId, currentPrice) {
        this.bids = bids;
        this.asks = asks;
        this.baseAsset = baseAsset;
        this.lastTradeId = lastTradeId || 0;
        this.currentPrice = currentPrice || 0;
    }
    ticker() {
        return `${this.baseAsset}_${this.quoteAsset}`;
    }
    getSnapshot() {
        return {
            baseAsset: this.baseAsset,
            bids: this.bids,
            asks: this.asks,
            lastTradeId: this.lastTradeId,
            currentPrice: this.currentPrice
        };
    }
    //TODO: Add self trade prevention
    addOrder(order) {
        if (order.side === "buy") {
            const { executedQty, fills } = this.matchBid(order);
            order.filled = executedQty;
            if (executedQty === order.quantity) {
                return {
                    executedQty,
                    fills
                };
            }
            this.bids.push(order);
            return {
                executedQty,
                fills
            };
        }
        else {
            const { executedQty, fills } = this.matchAsk(order);
            order.filled = executedQty;
            if (executedQty === order.quantity) {
                return {
                    executedQty,
                    fills
                };
            }
            this.asks.push(order);
            return {
                executedQty,
                fills
            };
        }
    }
    matchBid(order) {
        const fills = [];
        let executedQty = 0;
        for (let i = 0; i < this.asks.length; i++) {
            const ask = this.asks[i];
            if (!ask)
                continue;
            if (ask.price <= order.price && executedQty < order.quantity && ask.userId !== order.userId) {
                const filledQty = Math.min((order.quantity - executedQty), ask.quantity - ask.filled);
                executedQty += filledQty;
                ask.filled += filledQty;
                fills.push({
                    price: ask.price.toString(),
                    qty: filledQty,
                    tradeId: this.lastTradeId++,
                    otherUserId: ask.userId,
                    markerOrderId: ask.orderId
                });
            }
        }
        for (let i = 0; i < this.asks.length; i++) {
            const ask = this.asks[i];
            if (!ask)
                continue;
            if (ask.filled === ask.quantity) {
                this.asks.splice(i, 1);
                i--;
            }
        }
        return {
            fills,
            executedQty
        };
    }
    matchAsk(order) {
        const fills = [];
        let executedQty = 0;
        for (let i = 0; i < this.bids.length; i++) {
            const bid = this.bids[i];
            if (!bid)
                continue;
            if (bid.price >= order.price && executedQty < order.quantity && bid.userId !== order.userId) {
                const amountRemaining = Math.min(order.quantity - executedQty, bid.quantity - bid.filled);
                executedQty += amountRemaining;
                bid.filled += amountRemaining;
                fills.push({
                    price: bid.price.toString(),
                    qty: amountRemaining,
                    tradeId: this.lastTradeId++,
                    otherUserId: bid.userId,
                    markerOrderId: bid.orderId
                });
            }
        }
        for (let i = 0; i < this.bids.length; i++) {
            const bid = this.bids[i];
            if (!bid)
                continue;
            if (bid.filled === bid.quantity) {
                this.bids.splice(i, 1);
                i--;
            }
        }
        return {
            fills,
            executedQty
        };
    }
    //TODO: Can you make this faster? Can you compute this during order matches?
    getDepth() {
        const bids = [];
        const asks = [];
        const bidsObj = {};
        const asksObj = {};
        for (let i = 0; i < this.bids.length; i++) {
            const order = this.bids[i];
            if (!order)
                continue;
            const priceKey = order.price.toString();
            if (bidsObj[priceKey] === undefined) {
                bidsObj[priceKey] = 0;
            }
            bidsObj[priceKey] += order.quantity;
        }
        for (let i = 0; i < this.asks.length; i++) {
            const order = this.asks[i];
            if (!order)
                continue;
            const priceKey = order.price.toString();
            if (asksObj[priceKey] === undefined) {
                asksObj[priceKey] = 0;
            }
            asksObj[priceKey] += order.quantity;
        }
        for (const price in bidsObj) {
            const qty = bidsObj[price] || 0;
            bids.push([price, qty.toString()]);
        }
        for (const price in asksObj) {
            const qty = asksObj[price] || 0;
            asks.push([price, qty.toString()]);
        }
        return {
            bids,
            asks
        };
    }
    getOpenOrders(userId) {
        const asks = this.asks.filter(x => x.userId === userId);
        const bids = this.bids.filter(x => x.userId === userId);
        return [...asks, ...bids];
    }
    cancelBid(order) {
        const index = this.bids.findIndex(x => x.orderId === order.orderId);
        if (index !== -1) {
            const price = this.bids[index].price;
            this.bids.splice(index, 1);
            return price;
        }
    }
    cancelAsk(order) {
        const index = this.asks.findIndex(x => x.orderId === order.orderId);
        if (index !== -1) {
            const price = this.asks[index].price;
            this.asks.splice(index, 1);
            return price;
        }
    }
}
exports.Orderbook = Orderbook;
//# sourceMappingURL=orderbook.js.map