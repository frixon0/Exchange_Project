"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const perf_hooks_1 = require("perf_hooks");
const Engine_1 = require("./trade/Engine");
const latencies = [];
const engine = Engine_1.Engine.getinstance();
const TOTAL = 100000;
for (let i = 0; i < TOTAL; i++) {
    const start = perf_hooks_1.performance.now();
    engine.process({
        clientId: "1",
        message: {
            type: "CREATE_ORDER",
            data: {
                market: "TATA_INR",
                side: i % 2 ? "buy" : "sell",
                price: "100",
                quantity: "1",
                userId: i % 2 ? "1" : "2"
            }
        }
    });
    const end = perf_hooks_1.performance.now();
    latencies.push(end - start);
}
latencies.sort((a, b) => a - b);
const p50 = latencies[Math.floor(latencies.length * 0.50)];
const p95 = latencies[Math.floor(latencies.length * 0.95)];
const p99 = latencies[Math.floor(latencies.length * 0.99)];
const max = latencies[latencies.length - 1];
console.log({
    p50: `${p50?.toFixed(4)} ms`,
    p95: `${p95?.toFixed(4)} ms`,
    p99: `${p99?.toFixed(4)} ms`,
    max: `${max?.toFixed(4)} ms`
});
//# sourceMappingURL=benchmark.js.map