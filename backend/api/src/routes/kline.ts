import { Router } from "express";
import { pgPool } from "../db";

export const klineRouter =Router();

const KLINE_VIEWS: Record<string, string> = {
    "1m": "klines_1m",
    "1h": "klines_1h",
    "1w": "klines_1w",
};

klineRouter.get("/", async (req, res) => {
    const market = req.query.market as string | undefined;
    const interval = (req.query.interval as string | undefined) || "1m";
    const startTime = req.query.startTime ? new Date(Number(req.query.startTime)) : undefined;
    const endTime = req.query.endTime ? new Date(Number(req.query.endTime)) : undefined;
    const limit = Math.min(Number(req.query.limit || 100), 1000);
    const viewName = KLINE_VIEWS[interval];

    if (!market) {
        res.status(400).json({ error: "market is required" });
        return;
    }

    if (!viewName) {
        res.status(400).json({ error: "interval must be one of 1m, 1h, 1w" });
        return;
    }

    if ((startTime && Number.isNaN(startTime.getTime())) || (endTime && Number.isNaN(endTime.getTime()))) {
        res.status(400).json({ error: "startTime and endTime must be unix timestamps in milliseconds" });
        return;
    }

    try {
        const filters = ["market = $1"];
        const values: unknown[] = [market];

        if (startTime) {
            values.push(startTime);
            filters.push(`bucket >= $${values.length}`);
        }

        if (endTime) {
            values.push(endTime);
            filters.push(`bucket <= $${values.length}`);
        }

        values.push(Number.isFinite(limit) ? limit : 100);

        const result = await pgPool.query(
            `SELECT
                bucket,
                open,
                high,
                low,
                close,
                volume,
                quote_volume AS "quoteVolume",
                market
            FROM ${viewName}
            WHERE ${filters.join(" AND ")}
            ORDER BY bucket DESC
            LIMIT $${values.length}`,
            values
        );

        res.json(result.rows.reverse());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch klines" });
    }
})
