"use client"

import { Marketbar } from "@/components/Marketbar";
import { useParams } from "next/navigation";
import { Orderbook } from "@/components/orderbook";
export default function Page() {
  const { market } = useParams<{ market: string }>();
  const marketSymbol = decodeURIComponent(market).replaceAll("-", "_").toUpperCase();

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-[#0a0b0f] p-3">
      <Marketbar market={marketSymbol} />
      <div className="flex flex-1 flex-col gap-3 lg:flex-row">
        <div className="min-h-[520px] min-w-0 flex-1 rounded-lg border border-[#20212a] bg-[#101116] p-4 text-slate-500">
          chart
        </div>
        <div className="w-full shrink-0 lg:w-[360px]">
          <Orderbook market={marketSymbol} />
        </div>
      </div>
    </div>
  );
}
