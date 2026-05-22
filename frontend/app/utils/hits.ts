import axios from "axios"
import { depth, KLine, Ticker, trades } from "./types";
const BASE_URL = "http://localhost:3008/api/v1";
export async function getTrades(market:string):Promise<trades[]>{
    const res = await axios.get(BASE_URL+`/trades?symbol=${encodeURIComponent(market)}`);
    return res.data;
}
export async function getDepth(market:string):Promise<depth>{
    const res = await axios.get(BASE_URL+`/depth?symbol=${encodeURIComponent(market)}`);
    return res.data;
}
export async function getticker(market:string):Promise<Ticker>{
    const res = await axios.get(BASE_URL+`/ticker?symbol=${encodeURIComponent(market)}`);
    return res.data;
}
export async function getklines (starttime:string,endtime:string,market:string):Promise<KLine[]>{
    const res = await axios.get(BASE_URL+`/klines?symbol=${encodeURIComponent(market)}&intercal=1h&startTime=${starttime}&endTime=${endtime}`);
    const d:KLine[] = res.data;
     return d.sort((x, y) => (Number(x.end) < Number(y.end) ? -1 : 1));

}
export async function getmarkets()
{
    const res = await axios.get(BASE_URL+'/markets');
    return res.data;
}
