import { Client } from 'pg';
import { createClient } from 'redis';  
import { DbMessage } from './types';

const pgClient = new Client({
    user: 'your_user',
    host: 'localhost',
    database: 'my_database',
    password: 'your_password',
    port: 5432,
});
pgClient.connect();

function toNumber(value: string | number | undefined) {
    if (value === undefined) {
        return undefined;
    }

    return Number(value);
}

async function handleTradeAdded(data: Extract<DbMessage, { type: "TRADE_ADDED" }>["data"]) {
    const timestamp = new Date(data.timestamp);
    const price = Number(data.price);
    const quantity = Number(data.quantity);
    const quoteQuantity = Number(data.quoteQuantity);

    await pgClient.query(
        `INSERT INTO trades (
            id,
            market,
            time,
            price,
            quantity,
            quote_quantity,
            is_buyer_maker
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
            data.id,
            data.market,
            timestamp,
            price,
            quantity,
            quoteQuantity,
            data.isBuyerMaker
        ]
    );

    await pgClient.query(
        `INSERT INTO tickers (
            market,
            current_price,
            last_trade_id,
            volume_24h,
            quote_volume_24h,
            updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (market) DO UPDATE SET
            current_price = EXCLUDED.current_price,
            last_trade_id = EXCLUDED.last_trade_id,
            volume_24h = tickers.volume_24h + EXCLUDED.volume_24h,
            quote_volume_24h = tickers.quote_volume_24h + EXCLUDED.quote_volume_24h,
            updated_at = EXCLUDED.updated_at`,
        [
            data.market,
            price,
            data.id,
            quantity,
            quoteQuantity,
            timestamp
        ]
    );
}

async function handleOrderUpdate(data: Extract<DbMessage, { type: "ORDER_UPDATE" }>["data"]) {
    const executedQty = toNumber(data.executedQty) || 0;
    const quantity = toNumber(data.quantity);
    const status = data.status || (quantity !== undefined && executedQty >= quantity ? "filled" : "open");

    if (data.market && data.price && data.quantity && data.side) {
        await pgClient.query(
            `INSERT INTO orders (
                order_id,
                market,
                price,
                quantity,
                side,
                executed_qty,
                status,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT (order_id) DO UPDATE SET
                market = EXCLUDED.market,
                price = EXCLUDED.price,
                quantity = EXCLUDED.quantity,
                side = EXCLUDED.side,
                executed_qty = EXCLUDED.executed_qty,
                status = EXCLUDED.status,
                updated_at = NOW()`,
            [
                data.orderId,
                data.market,
                Number(data.price),
                quantity,
                data.side,
                executedQty,
                status
            ]
        );
        return;
    }

    await pgClient.query(
        `UPDATE orders
        SET
            executed_qty = executed_qty + $2,
            status = CASE
                WHEN $3::VARCHAR IS NOT NULL THEN $3
                WHEN quantity IS NOT NULL AND executed_qty + $2 >= quantity THEN 'filled'
                ELSE status
            END,
            updated_at = NOW()
        WHERE order_id = $1`,
        [data.orderId, executedQty, data.status]
    );
}

async function main() {
    const redisClient = createClient();
    await redisClient.connect();
    console.log("connected to redis");

    while (true) {
        const response = await redisClient.rPop("db_processor" as string)
        if (!response) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }  else {
            const data: DbMessage = JSON.parse(response);
            if (data.type === "TRADE_ADDED") {
                await handleTradeAdded(data.data);
            }

            if (data.type === "ORDER_UPDATE") {
                await handleOrderUpdate(data.data);
            }
        }
    }

}

main();
