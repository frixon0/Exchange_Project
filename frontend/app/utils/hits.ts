import { depth, KLine, Ticker, trades } from "./types";

const BASE_URL = "http://localhost:3008/api/v1";

async function getJson<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`);

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }

    return res.json();
}

export async function getTrades(market:string):Promise<trades[]>{
    return getJson<trades[]>(`/trades?symbol=${encodeURIComponent(market)}`);
}
export async function getDepth(market:string):Promise<depth>{
    return getJson<depth>(`/depth?symbol=${encodeURIComponent(market)}`);
}
export async function getticker(market:string):Promise<Ticker>{
    return getJson<Ticker>(`/ticker?symbol=${encodeURIComponent(market)}`);
}
export async function getklines (starttime:string,endtime:string,market:string):Promise<KLine[]>{
    const d = await getJson<KLine[]>(`/klines?symbol=${encodeURIComponent(market)}&interval=1h&startTime=${starttime}&endTime=${endtime}`);
     return d.sort((x, y) => Date.parse(x.end) - Date.parse(y.end));

}
export async function getmarkets()
{
    return getJson<string[]>('/markets');
}
