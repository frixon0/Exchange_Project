import { CREATE_ORDER, CANCEL_ORDER, ON_RAMP, GET_DEPTH, GET_OPEN_ORDERS } from "./to";
export type Msgfromclient = {
    type: typeof CREATE_ORDER,
    data: {
        market: string,
        price: string,
        quantity: string,
        side: "buy" | "sell",
        userId: string
    }
} | {
    type: typeof CANCEL_ORDER,
    data   : {
        market: string,
        orderId: string,
        userId: string
    }
} | {

    type: typeof ON_RAMP,
    data    : {
        userId: string, 
        amount: number,
        currency: string
    }   

}
| {
    type: typeof GET_OPEN_ORDERS,
    data: {
        userId: string,
        market:string
    }
}   | {
    type: typeof GET_DEPTH,
    data: {
        market: string
    }
}   
