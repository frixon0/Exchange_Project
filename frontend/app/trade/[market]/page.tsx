"use client"

import { Marketbar } from "@/components/Marketbar";
import { useParams } from "next/navigation";
import { Orderbook } from "@/components/orderbook";
import { MarketChart } from "@/components/MarketChart";
import Link from "next/link";
export default function Page() {
  const { market } = useParams<{ market: string }>();
  const marketSymbol = decodeURIComponent(market).replaceAll("-", "_").toUpperCase();

  return (
    <div className="flex h-screen flex-col gap-2 overflow-hidden bg-[#0a0b0f] p-2">
      <div className="flex ">
        <Link
          href="/trade"
          className="rounded border border-[#20212a] bg-[#14151b] px-3 py-1 text-sm text-slate-300"
        >
          MARKETS
        </Link>
         
      </div>
      <div className="grid grid-cols-5 gap-2 ">
        <div className="col-span-5 h-fit">
    <Marketbar market={marketSymbol} />
    </div>

  <div className="col-span-3">
   <MarketChart market={marketSymbol} />
    </div>

  <div className="w-full shrink-0 lg:w-[360px] col-span-1">
   <Orderbook market={marketSymbol} />
    </div>
    <div className="col-span-1">

    </div>
      
      </div>
    </div>
  );
}
