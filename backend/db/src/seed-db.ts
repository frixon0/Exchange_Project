const { Client } = require('pg');

const client = new Client({
    user: 'your_user',
    host: 'localhost',
    database: 'my_database',
    password: 'your_password',
    port: 5432,
});

async function initializeDB() {
    await client.connect();

    await client.query(`
        DROP MATERIALIZED VIEW IF EXISTS klines_1m;
        DROP MATERIALIZED VIEW IF EXISTS klines_1h;
        DROP MATERIALIZED VIEW IF EXISTS klines_1w;

        DROP TABLE IF EXISTS trades;
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS tickers;

        CREATE TABLE trades (
            id              VARCHAR(64) NOT NULL,
            market          VARCHAR(32) NOT NULL,
            time            TIMESTAMP WITH TIME ZONE NOT NULL,
            price           DOUBLE PRECISION NOT NULL,
            quantity        DOUBLE PRECISION NOT NULL,
            quote_quantity  DOUBLE PRECISION NOT NULL,
            is_buyer_maker  BOOLEAN NOT NULL
        );

        CREATE INDEX trades_market_time_idx ON trades (market, time DESC);
        
        SELECT create_hypertable('trades', 'time', if_not_exists => TRUE);
    `);

    await client.query(`
        CREATE TABLE orders (
            order_id        VARCHAR(64) PRIMARY KEY,
            market          VARCHAR(32),
            price           DOUBLE PRECISION,
            quantity        DOUBLE PRECISION,
            side            VARCHAR(4),
            executed_qty    DOUBLE PRECISION NOT NULL DEFAULT 0,
            status          VARCHAR(16) NOT NULL DEFAULT 'open',
            created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );

        CREATE INDEX orders_market_updated_at_idx ON orders (market, updated_at DESC);
    `);

    await client.query(`
        CREATE TABLE tickers (
            market              VARCHAR(32) PRIMARY KEY,
            current_price       DOUBLE PRECISION NOT NULL,
            last_trade_id       VARCHAR(64),
            volume_24h          DOUBLE PRECISION NOT NULL DEFAULT 0,
            quote_volume_24h    DOUBLE PRECISION NOT NULL DEFAULT 0,
            updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
    `);

    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1m AS
        SELECT
            time_bucket('1 minute', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(quantity) AS volume,
            sum(quote_quantity) AS quote_volume,
            market
        FROM trades
        GROUP BY bucket, market;
    `);

    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1h AS
        SELECT
            time_bucket('1 hour', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(quantity) AS volume,
            sum(quote_quantity) AS quote_volume,
            market
        FROM trades
        GROUP BY bucket, market;
    `);

    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1w AS
        SELECT
            time_bucket('1 week', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(quantity) AS volume,
            sum(quote_quantity) AS quote_volume,
            market
        FROM trades
        GROUP BY bucket, market;
    `);

    await client.end();
    console.log("Database initialized successfully");
}

initializeDB().catch(console.error);
