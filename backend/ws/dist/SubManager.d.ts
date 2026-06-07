export declare class SubManager {
    private subscriptions;
    private redisClient;
    private channeldetail;
    private static instance;
    private constructor();
    static getInstance(): SubManager;
    subscribe(userId: string, stream: string): void;
    unsubscribe(userId: string, stream: string): void;
    leftuser(userId: string): void;
}
//# sourceMappingURL=SubManager.d.ts.map