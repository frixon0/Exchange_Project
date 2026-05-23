import { BookTicker, depth, KLine, Ticker } from "./types";

const BASE_URL = 'wss://ws.backpack.exchange/'

type CallbackEntry = {
    callback: (data: unknown) => void;
    id: string;
};

type SubscriptionMessage = {
    method: "SUBSCRIBE" | "UNSUBSCRIBE";
    params: string[];
};

type StreamData = {
    e?: string;
    o?: string;
    h?: string;
    c?: string;
    l?: string;
    v?: string;
    V?: string;
    s?: string;
    n?: string;
    p?: string;
    b?: [string, string][] | string;
    B?: string;
    a?: [string, string][] | string;
    A?: string;
    t?: string;
    T?: string;
};

type StreamMessage = StreamData & {
    stream?: string;
    data?: StreamData;
};

export class sigManager {
    private ws: WebSocket;
    private static instance : sigManager;
    private bufferedmessages: string[] = [];
    private isConnected: boolean = false;
    private callbacks: Record<string, CallbackEntry[]> = {};
    private constructor() {
        console.info("Backpack websocket creating", BASE_URL);
        this.ws = new WebSocket(BASE_URL);
        this.bufferedmessages = [];
        this.init();
    }
    public static getInstance(): sigManager {
        if (!sigManager.instance) {
            sigManager.instance = new sigManager();
        }
        return sigManager.instance;
    }
    init(){
        this.ws.onopen = () => {
            console.info("Backpack websocket opened");
            this.isConnected = true;
            this.bufferedmessages.forEach((message) => {
                console.info("Backpack websocket sending buffered message", message);
                this.ws.send(message);
            });
            this.bufferedmessages = [];
        };
        this.ws.onmessage = (event) => {
            console.info("Backpack websocket received", event.data);
            const message = JSON.parse(event.data) as StreamMessage;
            const data = message.data ?? message;
            const type = data.e ?? message.stream?.split(".")[0];
            console.info("Backpack websocket event type", type);
            if (type && this.callbacks[type]) {
                this.callbacks[type].forEach((cb) => {
                    if(type==='ticker') {
                        const firstPrice = Number(data.o);
                        const lastPrice = Number(data.c);
                        const priceChange =
                            Number.isFinite(firstPrice) && Number.isFinite(lastPrice)
                                ? String(lastPrice - firstPrice)
                                : undefined;
                        const priceChangePercent =
                            firstPrice !== 0 && Number.isFinite(firstPrice) && Number.isFinite(lastPrice)
                                ? String(((lastPrice - firstPrice) / firstPrice) * 100)
                                : undefined;
                        const newTickerData:Partial<Ticker> = {
                            firstPrice: data.o,
                            high: data.h,
                            lastPrice: data.c,
                            low: data.l,
                            priceChange,
                            priceChangePercent,
                            volume: data.v,
                            quoteVolume: data.V,
                            symbol: data.s,
                            trades: data.n,
                        }

                        cb.callback(newTickerData);
                    }
                    if(type==='trade') {
                        const newTickerData:Partial<Ticker> = {
                            lastPrice: data.p,
                            symbol: data.s,
                        }

                        cb.callback(newTickerData);
                    }
                    if(type==='bookTicker') {
                        const newBookTickerData:Partial<BookTicker> = {
                            askPrice: typeof data.a === "string" ? data.a : undefined,
                            askQuantity: data.A,
                            bidPrice: typeof data.b === "string" ? data.b : undefined,
                            bidQuantity: data.B,
                            symbol: data.s,
                        }

                        cb.callback(newBookTickerData);
                    }
                    if(type==='depth') {
                        const newdepthData:Partial<depth> = {
                            bids:Array.isArray(data.b) ? data.b : undefined,
                            asks:Array.isArray(data.a) ? data.a : undefined,
                        }
                        cb.callback(newdepthData);
                    }
                    if(type==='kline') {
                        const newKlineData:Partial<KLine> = {
                            open: data.o,
                            high: data.h,
                            low: data.l,
                            close: data.c,
                            volume: data.v,
                            trades: data.n,
                            start: data.t,
                            end: data.T,
                            
                        }
                        cb.callback(newKlineData);

                    }
                });
            }
    };
        this.ws.onerror = (event) => {
            console.error("Backpack websocket error", event);
        };
        this.ws.onclose = (event) => {
            this.isConnected = false;
            console.warn("Backpack websocket closed", event.code, event.reason);
        };
    }
    sendMessage(message: SubscriptionMessage) {
        const messageToSend = JSON.stringify(message);
        if (!this.isConnected) {
            console.info("Backpack websocket buffering message", messageToSend);
            this.bufferedmessages.push(messageToSend);
            return;
        }
        console.info("Backpack websocket sending message", messageToSend);
        this.ws.send(messageToSend);
    }
    async register<T>(type:string ,callback: (data: T) => void,id:string) {
        console.info("Backpack websocket registering callback", type, id);
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push({ callback: callback as (data: unknown) => void,id  });
    }
    async deregister(type:string ,id:string) {
        console.info("Backpack websocket deregistering callback", type, id);
        if (this.callbacks[type]) {
            this.callbacks[type] = this.callbacks[type].filter((cb: { id: string }) => cb.id !== id);
        }
    }
}
