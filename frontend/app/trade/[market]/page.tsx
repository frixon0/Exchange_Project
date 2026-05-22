"use client"

import { Marketbar } from "@/components/Marketbar";
import { useParams } from "next/navigation";
import { Orderbook } from "@/components/orderbook";
import { MarketChart } from "@/components/MarketChart";
export default function Page() {
  const { market } = useParams<{ market: string }>();
  const marketSymbol = decodeURIComponent(market).replaceAll("-", "_").toUpperCase();

  return (
    <div className="flex h-screen flex-col gap-2 overflow-hidden bg-[#0a0b0f] p-2">
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
