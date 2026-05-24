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
      <div className="flex gap-8">
        <Link
          href="/trade"
          className="rounded border border-[#20212a] bg-[#14151b] px-3 py-1 text-sm text-slate-300"
        >
          MARKETS
        </Link>
         
      </div>
      <Marketbar market={marketSymbol} />
      <div className="flex min-h-0 flex-1 flex-col gap-2 lg:flex-row">
        <div className="min-w-0 flex-1">
          <MarketChart market={marketSymbol} />
        </div>
        <div className="w-full shrink-0 lg:w-[360px]">
          <Orderbook market={marketSymbol} />
        </div>
      </div>
    </div>
  );
}
