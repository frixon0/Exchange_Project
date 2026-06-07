import { Router } from "express";
import { pgPool } from "../db";

export const tradeRouter =Router();

tradeRouter.get("/", async (req, res) => {
    const market = req.query.market as string | undefined;
    const limit = Math.min(Number(req.query.limit || 50), 1000);

    if (!market) {
        res.status(400).json({ error: "market is required" });
        return;
    }

    try {
        const result = await pgPool.query(
            `SELECT
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
            LIMIT $2`,
            [market, Number.isFinite(limit) ? limit : 50]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch trades" });
    }
})
