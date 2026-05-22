import { depth, KLine, Ticker } from "./types";

const BASE_URL = 'wss://ws.backpack.exchange/'
export class sigManager {
    private ws: WebSocket;
    private static instance : sigManager;
    private bufferedmessages: string[] = [];
    private isConnected: boolean = false;
    private id: number ;
    private callbacks: any = {};
    private constructor() {
        this.ws = new WebSocket(BASE_URL);
        this.bufferedmessages = [];
        this.id=1;
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
            this.isConnected = true;
            this.bufferedmessages.forEach((message) => {
                this.ws.send(message);
            });
            this.bufferedmessages = [];
        };
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const type = message.data?.e;
            if (type && this.callbacks[type]) {
                this.callbacks[type].forEach((cb: { callback: (data: any) => void; id: string }) => {
                    if(type==='ticker') {
                        const newTickerData:Partial<Ticker> = {
                            firstPrice: message.data.o,
                            high: message.data.h,
                            lastPrice: message.data.c,
                            low: message.data.l,
                            volume: message.data.v,
                            quoteVolume: message.data.V,
                            symbol: message.data.s,
                            trades: message.data.n,
                        }

                        cb.callback(newTickerData);
                    }
                    if(type==='depth') {
                        const newdepthData:Partial<depth> = {
                            bids:message.data.b,
                            asks:message.data.a,
                        }
                        cb.callback(newdepthData);
                    }
                    if(type==='KLine') {
                        const newKlineData:Partial<KLine> = {
                            open: message.data.k.o,
                            high: message.data.k.h,
                            low: message.data.k.l,
                            close: message.data.k.c,
                            volume: message.data.k.v,
                            trades: message.data.k.n,
                            start: message.data.k.t,
                            end: message.data.k.T,
                            
                        }
                        cb.callback(newKlineData);

                    }
                });
            }
    };
    }
    async register(type:string ,callback: (data: any) => void,id:string) {
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push({ callback,id  });
    }
}