export interface depth{
    bids:[string,string][],
    asks:[string,string][],
    market?: string,
    lastUpdateId?:string
}
export interface trades{
    id:string,
    market:string,
    time:string,
    price:string,
    quantity:string,
    quoteQuantity:string,
    isBuyerMaker: boolean    
}
export interface KLine {
    close: string;
    end: string;
    high: string;
    low: string;
    open: string;
    quoteVolume: string;
    start: string;
    trades: string;
    volume: string;
}

export interface Ticker {
    firstPrice?: string,
    high?: string,
    lastPrice: string,
    low?: string,
    priceChange?: string,
    priceChangePercent?: string,
    quoteVolume: string,
    symbol: string,
    trades?: string,
    volume: string
}

export interface BookTicker {
    askPrice: string;
    askQuantity: string;
    bidPrice: string;
    bidQuantity: string;
    symbol: string;
}
