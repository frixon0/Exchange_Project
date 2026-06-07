import { MsgToEngine } from "./types/to";
import { MessageFromOrderbook } from "./types";
export declare class RedisManager {
    private client;
    private publisher;
    private static instance;
    private constructor();
    static getInstance(): RedisManager;
    sendAndAwait(message: MsgToEngine): Promise<MessageFromOrderbook>;
}
//# sourceMappingURL=reddisManager.d.ts.map