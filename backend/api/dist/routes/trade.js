"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradeRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
exports.tradeRouter = (0, express_1.Router)();
exports.tradeRouter.get("/", async (req, res) => {
    const market = req.query.market;
    const limit = Math.min(Number(req.query.limit || 50), 1000);
    if (!market) {
        res.status(400).json({ error: "market is required" });
        return;
    }
    try {
        const result = await db_1.pgPool.query(`SELECT
                id,
                market,
                time,
                price,
                quantity,
                quote_quantity AS "quoteQuantity",
                is_buyer_maker AS "isBuyerMaker"
            FROM trades
            WHERE market = $1
            ORDER BY time DESC
            LIMIT $2`, [market, Number.isFinite(limit) ? limit : 50]);
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch trades" });
    }
});
//# sourceMappingURL=trade.js.map