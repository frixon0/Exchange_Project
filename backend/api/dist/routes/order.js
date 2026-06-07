"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = require("express");
const reddisManager_1 = require("../reddisManager");
const types_1 = require("../types");
exports.orderRouter = (0, express_1.Router)();
exports.orderRouter.post("/", async (req, res) => {
    const { market, side, price, quantity, userId } = req.body;
    const response = await reddisManager_1.RedisManager.getInstance().sendAndAwait({
        type: types_1.CREATE_ORDER,
        data: {
            market,
            side,
            price,
            quantity,
            userId
        }
    });
    res.json(response.payload);
});
exports.orderRouter.delete("/", async (req, res) => {
    const { orderId, userId, market } = req.body;
    if (!orderId || !userId || !market) {
        res.status(400).json({ error: "orderId, userId and market are required" });
        return;
    }
    const response = await reddisManager_1.RedisManager.getInstance().sendAndAwait({
        type: types_1.CANCEL_ORDER,
        data: {
            market,
            orderId,
            userId
        }
    });
    res.json(response.payload);
});
exports.orderRouter.get("/open", async (req, res) => {
    const response = await reddisManager_1.RedisManager.getInstance().sendAndAwait({
        type: types_1.GET_OPEN_ORDERS,
        data: {
            userId: req.query.userId,
            market: req.query.market
        }
    });
    res.json(response.payload);
});
exports.orderRouter.get("/on_ramp", async (req, res) => {
    const { userId, amount } = req.body;
    const response = await reddisManager_1.RedisManager.getInstance().sendAndAwait({
        type: types_1.ON_RAMP,
        data: {
            userId: userId,
            amount: amount
        }
    });
    res.json(response.payload);
});
exports.orderRouter.get("/balance", async (req, res) => {
    const userId = req.body;
    const currency = req.body;
    const response = await reddisManager_1.RedisManager.getInstance().sendAndAwait({
        type: types_1.GET_BALANCE,
        data: {
            userId: userId,
            Asset: currency
        }
    });
    res.json(response.payload);
});
//# sourceMappingURL=order.js.map