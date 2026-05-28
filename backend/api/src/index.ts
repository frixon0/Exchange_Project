import express from "express"
import cors from "cors"
import { orderRouter } from "./routes/order";
import { tickerRouter } from "./routes/ticker";
import { depthRouter } from "./routes/depth";
import { klineRouter } from "./routes/kline";
import { tradeRouter } from "./routes/trade";
const app  =express();
const PORT = 3010;
app.use(cors());
app.use(express.json());
app.use("api/v1/order",orderRouter);
app.use("api/v1/ticker",tickerRouter);
app.use("api/v1/depth",depthRouter);
app.use("api/v1/kline",klineRouter);
app.use("api/v1/trade",tradeRouter);

app.listen(PORT);

