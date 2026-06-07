import { MessageToAPI } from "./types/to";
type DbMessage = {
    type: string;
    data: unknown;
};
type WsMessage = {
    stream: string;
    data: unknown;
};
export declare class RedisManager {
    private client;
    private static instance;
    private constructor();
    static getInstance(): RedisManager;
    pushMessage(message: DbMessage): void;
    publishMessage(channel: string, message: WsMessage): void;
    sendtoAPI(clientID: string, message: MessageToAPI): void;
}
export {};
//# sourceMappingURL=ReddisManager.d.ts.map