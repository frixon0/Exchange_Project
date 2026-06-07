import { depth, KLine, Ticker, trades } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3010/api/v1";

type BackendTrade = {
    id: string;
    market: string;
    time: string;
    price: number | string;
    quantity: number | string;
    quoteQuantity: number | string;
    isBuyerMaker: boolean;
};

type BackendKLine = {
    bucket: string;
    open: number | string;
    high: number | string;
    low: number | string;
    close: number | string;
    volume: number | string;
    quoteVolume: number | string;
    market: string;
};

type BackendTicker = {
    market: string;
    currentPrice: number | string;
    lastTradeId?: string;
    volume24h: number | string;
    quoteVolume24h: number | string;
    updatedAt: string;
};

async function getJson<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }

    return res.json();
}

async function sendJson<T>(path: string, init: Omit<RequestInit, "body"> & { body?: unknown }): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            ...(init.headers || {}),
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }

    return res.json();
}

export type PlaceOrderRequest = {
    market: string;
    price: string;
    quantity: string;
    side: "buy" | "sell";
    userId: string;
};

export type PlaceOrderResponse = {
    orderId: string;
    executedQty: number;
    fills?: {
        price: string;
        qty: number;
        tradeId: number;
    }[];
    remainingQty?: number;
};

function toTicker(ticker: BackendTicker): Ticker {
    const lastPrice = String(ticker.currentPrice);

    return {
        firstPrice: lastPrice,
        high: lastPrice,
        lastPrice,
        low: lastPrice,
        priceChange: "0",
        priceChangePercent: "0",
        quoteVolume: String(ticker.quoteVolume24h),
        symbol: ticker.market,
        trades: ticker.lastTradeId,
        volume: String(ticker.volume24h),
    };
}

function toKline(kline: BackendKLine): KLine {
    return {
        close: String(kline.close),
        end: kline.bucket,
        high: String(kline.high),
        low: String(kline.low),
        open: String(kline.open),
        quoteVolume: String(kline.quoteVolume),
        start: kline.bucket,
        trades: "0",
        volume: String(kline.volume),
    };
}

function toTrade(trade: BackendTrade): trades {
    return {
        id: trade.id,
        market: trade.market,
        time: trade.time,
        price: String(trade.price),
        quantity: String(trade.quantity),
        quoteQuantity: String(trade.quoteQuantity),
        isBuyerMaker: trade.isBuyerMaker,
    };
}

export async function getTrades(market:string):Promise<trades[]>{
    const data = await getJson<BackendTrade[]>(`/trade?market=${encodeURIComponent(market)}&limit=50`);
    return data.map(toTrade);
}
export async function getDepth(market:string):Promise<depth>{
    return getJson<depth>(`/depth/depth?market=${encodeURIComponent(market)}`);
}
export async function getticker(market:string):Promise<Ticker>{
    const data = await getJson<BackendTicker>(`/ticker?market=${encodeURIComponent(market)}`);
    return toTicker(data);
}
export async function getklines (starttime:string,endtime:string,market:string):Promise<KLine[]>{
    const startMs = Number(starttime) * 1000;
    const endMs = Number(endtime) * 1000;
    const d = await getJson<BackendKLine[]>(`/kline?market=${encodeURIComponent(market)}&interval=1h&startTime=${startMs}&endTime=${endMs}&limit=200`);
    return d.map(toKline).sort((x, y) => Date.parse(x.end) - Date.parse(y.end));

}
export async function getmarkets()
{
    const tickers = await gettickers();
    return tickers.map((ticker) => ticker.symbol);
}
export async function gettickers()
{
    const data = await getJson<BackendTicker[]>('/ticker');
    return data.map(toTicker);
}

export async function placeOrder(order: PlaceOrderRequest): Promise<PlaceOrderResponse> {
    return sendJson<PlaceOrderResponse>(`/order`, {
        method: "POST",
        body: order,
    });
}
