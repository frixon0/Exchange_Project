import { performance } from "perf_hooks";
import { Engine } from "./trade/Engine";
const TOTAL = 100000;
const engine = Engine.getinstance()
const start = performance.now();

for(let i = 0; i < TOTAL; i++) {

    engine.process({
        clientId: `user-${i % 1000}`,
        message: {
            type: "CREATE_ORDER",
            data: {
                market: "TATA_INR",
                side: i % 2 === 0 ? "buy" : "sell",
                price: "10",
                quantity: "1",
                userId:i % 2 === 0?"6":"7"
            }
        }
    });
}

const end = performance.now();

const seconds = (end - start) / 1000;

console.log("===== ENGINE BENCHMARK =====");
console.log(`Orders Processed : ${TOTAL}`);
console.log(`Time Taken       : ${seconds.toFixed(2)} sec`);
console.log(
    `Throughput       : ${(TOTAL / seconds).toFixed(2)} orders/sec`
);