import { Msgfromclient } from "../types/recieve";
import { Fill, Order, Orderbook } from "./orderbook";
export declare const BASE_CURRENCY = "INR";
export declare class Engine {
    private orderbooks;
    private balances;
    private static instance;
    private constructor();
    static getinstance(): Engine;
    saveSnapshot(): void;
    process({ message, clientId }: {
        message: Msgfromclient;
        clientId: string;
    }): void;
    getBalance(userId: string, asset: string): number;
    addOrderbook(orderbook: Orderbook): void;
    createOrder(market: string, price: string, quantity: string, side: "buy" | "sell", userId: string): {
        executedQty: number;
        fills: Fill[];
        orderId: string;
    };
    updateDbOrders(order: Order, executedQty: number, fills: Fill[], market: string): void;
    createDbTrades(fills: Fill[], market: string, userId: string): void;
    publishWsTrades(fills: Fill[], userId: string, market: string): void;
    sendUpdatedDepthAt(price: string, market: string): void;
    publisWsDepthUpdates(fills: Fill[], price: string, side: "buy" | "sell", market: string): void;
    updateBalance(userId: string, baseAsset: string, quoteAsset: string, side: "buy" | "sell", fills: Fill[], executedQty: number): void;
    checkAndLockFunds(baseAsset: string, quoteAsset: string, side: "buy" | "sell", userId: string, asset: string, price: string, quantity: string): void;
    onRamp(userId: string, amount: number): {
        amount_updated: number;
        total_balance: number;
    };
    setBaseBalances(): void;
}
//# sourceMappingURL=Engine.d.ts.map