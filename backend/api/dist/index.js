"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_1 = require("./routes/order");
const ticker_1 = require("./routes/ticker");
const depth_1 = require("./routes/depth");
const kline_1 = require("./routes/kline");
const trade_1 = require("./routes/trade");
const app = (0, express_1.default)();
const PORT = 3010;
// app.use(cors());
app.use(express_1.default.json());
app.use("/api/v1/order", order_1.orderRouter);
app.use("/api/v1/ticker", ticker_1.tickerRouter);
app.use("/api/v1/depth", depth_1.depthRouter);
app.use("/api/v1/kline", kline_1.klineRouter);
app.use("/api/v1/trade", trade_1.tradeRouter);
app.listen(PORT);
//# sourceMappingURL=index.js.map