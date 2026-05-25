"use client"

import { Marketbar } from "@/components/Marketbar";
import { useParams } from "next/navigation";
import { Orderbook } from "@/components/orderbook";
import { MarketChart } from "@/components/MarketChart";
import Link from "next/link";
import { Trade_ui } from "@/components/Trade_ui";
export default function Page() {
  const { market } = useParams<{ market: string }>();
  const marketSymbol = decodeURIComponent(market).replaceAll("-", "_").toUpperCase();
  
  return (
 <div className="h-screen w-full overflow-hidden bg-[#0a0b0f] p-2">
      <div className="flex h-full flex-col gap-2">
        
        <div className="shrink-0">
          <Link
            href="/trade"
            className="rounded border border-[#20212a] bg-[#14151b] px-3 py-1 text-sm text-slate-300"
          >
            MARKETS
          </Link>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] gap-2">

          <div className="flex min-w-0 flex-col gap-2">
            
            <div className="shrink-0">
              <Marketbar market={marketSymbol} />
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] gap-2">

              <div className="min-w-0 overflow-hidden rounded-xl border border-[#1d2235] bg-[#0f1220]">
                   <div className="h-full w-full">
                       <MarketChart market={marketSymbol} />
                  </div>
              </div>

              <div className="min-w-0 overflow-hidden rounded-xl border border-[#1d2235] bg-[#0f1220]">
                <Orderbook market={marketSymbol} />
              </div>

            </div>
          </div>

          <div className="min-w-0 overflow-y-auto rounded-xl border border-[#1d2235] bg-[#0f1220]">
            <Trade_ui market={marketSymbol} />
          </div>

        </div>
      </div>
    </div>
  );
}
