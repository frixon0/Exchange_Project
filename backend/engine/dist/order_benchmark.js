"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const perf_hooks_1 = require("perf_hooks");
const Engine_1 = require("./trade/Engine");
const TOTAL = 100000;
const engine = Engine_1.Engine.getinstance();
const start = perf_hooks_1.performance.now();
for (let i = 0; i < TOTAL; i++) {
    engine.process({
        clientId: `user-${i % 1000}`,
        message: {
            type: "CREATE_ORDER",
            data: {
                market: "TATA_INR",
                side: i % 2 === 0 ? "buy" : "sell",
                price: "10",
                quantity: "1",
                userId: i % 2 === 0 ? "6" : "7"
            }
        }
    });
}
const end = perf_hooks_1.performance.now();
const seconds = (end - start) / 1000;
console.log("===== ENGINE BENCHMARK =====");
console.log(`Orders Processed : ${TOTAL}`);
console.log(`Time Taken       : ${seconds.toFixed(2)} sec`);
console.log(`Throughput       : ${(TOTAL / seconds).toFixed(2)} orders/sec`);
//# sourceMappingURL=order_benchmark.js.map