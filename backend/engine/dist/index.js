"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const Engine_1 = require("./trade/Engine");
async function main() {
    const engine = Engine_1.Engine.getinstance();
    const client = (0, redis_1.createClient)();
    await client.connect();
    while (true) {
        const res = await client.rPop("messages");
        if (!res) {
        }
        else {
            const { clientId, message } = JSON.parse(res);
            engine.process({ message, clientId });
            //push to engine
        }
    }
}
main();
//# sourceMappingURL=index.js.map