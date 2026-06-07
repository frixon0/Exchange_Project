import { CREATE_ORDER, CANCEL_ORDER, ON_RAMP, GET_DEPTH, GET_OPEN_ORDERS, GET_BALANCE } from ".";
export type MsgToEngine = {
    type: typeof CREATE_ORDER;
    data: {
        market: string;
        price: string;
        quantity: string;
        side: "buy" | "sell";
        userId: string;
    };
} | {
    type: typeof CANCEL_ORDER;
    data: {
        market: string;
        orderId: string;
        userId: string;
    };
} | {
    type: typeof ON_RAMP;
    data: {
        userId: string;
        amount: number;
    };
} | {
    type: typeof GET_OPEN_ORDERS;
    data: {
        userId: string;
        market: string;
    };
} | {
    type: typeof GET_DEPTH;
    data: {
        market: string;
    };
} | {
    type: typeof GET_BALANCE;
    data: {
        userId: string;
        Asset: string;
    };
};
//# sourceMappingURL=to.d.ts.map