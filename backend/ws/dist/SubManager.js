"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubManager = void 0;
const redis_1 = require("redis");
const UserManager_1 = require("./UserManager");
class SubManager {
    subscriptions = new Map();
    redisClient;
    channeldetail = new Map();
    static instance;
    constructor() {
        this.redisClient = (0, redis_1.createClient)();
        this.redisClient.connect();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new SubManager();
        }
        return this.instance;
    }
    subscribe(userId, stream) {
        if (!this.subscriptions.get(userId)?.includes(stream)) {
            const connec_streams = this.subscriptions.get(userId) || [];
            connec_streams.push(stream);
            this.subscriptions.set(userId, connec_streams);
            const connec_users = this.channeldetail.get(stream) || [];
            connec_users.push(userId);
            this.channeldetail.set(stream, connec_users);
            if (this.channeldetail.get(stream)?.length === 1) {
                this.redisClient.subscribe(stream, (message) => {
                    this.channeldetail.get(stream)?.forEach(s => UserManager_1.UserManager.getInstance().getUser(s)?.emit(JSON.parse(message)));
                });
            }
        }
        else {
            return;
        }
    }
    unsubscribe(userId, stream) {
        const connec_streams = this.subscriptions.get(userId);
        if (connec_streams) {
            this.subscriptions.set(userId, connec_streams.filter(x => x != stream));
        }
        const connec_users = this.channeldetail.get(stream);
        if (connec_users) {
            this.channeldetail.set(stream, connec_users.filter(x => x != userId));
            if (this.channeldetail.get(stream)?.length === 0) {
                this.channeldetail.delete(stream);
                this.redisClient.unsubscribe(stream);
            }
        }
    }
    leftuser(userId) {
        this.subscriptions.get(userId)?.forEach(s => this.unsubscribe(userId, s));
    }
}
exports.SubManager = SubManager;
//# sourceMappingURL=SubManager.js.map