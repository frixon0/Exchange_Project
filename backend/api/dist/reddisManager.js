"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisManager = void 0;
const redis_1 = require("redis");
class RedisManager {
    client;
    publisher;
    static instance;
    constructor() {
        this.client = (0, redis_1.createClient)();
        this.client.connect();
        this.publisher = (0, redis_1.createClient)();
        this.publisher.connect();
    }
    static getInstance() {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }
        return RedisManager.instance;
    }
    sendAndAwait(message) {
        return new Promise((resolve) => {
            const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            this.client.subscribe(id, (message) => {
                resolve(JSON.parse(message));
            });
            this.publisher.lPush("messages", JSON.stringify({ clientId: id, message }));
        });
    }
}
exports.RedisManager = RedisManager;
//# sourceMappingURL=reddisManager.js.map