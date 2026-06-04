
## DB processor

The DB worker consumes messages from the Redis `db_processor` queue and persists:

- `trades`: every executed trade, including market, price, quantity, quote quantity, timestamp, and maker side.
- `orders`: order state from `ORDER_UPDATE` events, including executed quantity and status.
- `tickers`: latest price per market, updated from each trade.
- `klines_1m`, `klines_1h`, `klines_1w`: materialized views generated from trades for chart candles.
