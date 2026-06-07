import { Router } from "express";
import { pgPool } from "../db";

export const tickerRouter =Router();

tickerRouter.get("/", async (req, res) => {
    const market = req.query.market as string | undefined;

    try {
        const result = market
            ? await pgPool.query(
                `SELECT
                    market,
                    current_price AS "currentPrice",
                    last_trade_id AS "lastTradeId",
                    volume_24h AS "volume24h",
                    quote_volume_24h AS "quoteVolume24h",
                    updated_at AS "updatedAt"
                FROM tickers
                WHERE market = $1`,
                [market]
            )
            : await pgPool.query(
                `SELECT
                    market,
                    current_price AS "currentPrice",
                    last_trade_id AS "lastTradeId",
                    volume_24h AS "volume24h",
                    quote_volume_24h AS "quoteVolume24h",
                    updated_at AS "updatedAt"
                FROM tickers
                ORDER BY market`
            );

        if (market && result.rows.length === 0) {
            res.status(404).json({ error: "Ticker not found" });
            return;
        }

        res.json(market ? result.rows[0] : result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch ticker" });
    }
})
