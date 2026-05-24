"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { gettickers } from "../utils/hits";
import { Ticker } from "../utils/types";

const formatNumber = (value?: string, options?: Intl.NumberFormatOptions) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", options).format(number);
};

const formatPercent = (value?: string) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
};

export default function MarketList() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let ignore = false;

    gettickers()
      .then((data) => {
        if (!ignore) {
          setTickers(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!ignore) {
          setTickers([]);
          setStatus("error");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0b0f] p-4 text-white">
      <div className="mx-auto flex max-w-3xl flex-col rounded-lg border border-[#20212a] bg-[#101116]">
        <div className="grid grid-cols-3 gap-4 border-b border-[#20212a] px-4 py-3 text-xs font-medium uppercase text-slate-500">
          <span>Market</span>
          <span className="text-right">Last Price</span>
          <span className="text-right">24h Change</span>
        </div>

        {status === "loading" ? (
          <div className="px-4 py-6 text-sm text-slate-500">
            Loading markets
          </div>
        ) : null}

        {status === "error" ? (
          <div className="px-4 py-6 text-sm text-red-300">
            Markets unavailable
          </div>
        ) : null}

        {status === "ready"
          ? tickers.map((ticker) => {
              const change = Number(ticker.priceChangePercent);
              const changeClass =
                Number.isFinite(change) && change >= 0
                  ? "text-emerald-400"
                  : "text-red-400";

              return (
                <Link
                  className="grid grid-cols-3 gap-4 border-b border-[#20212a] px-4 py-3 text-sm last:border-b-0 hover:bg-white/5"
                  href={`/trade/${ticker.symbol.toLowerCase().replaceAll("_", "-")}`}
                  key={ticker.symbol}
                >
                  <span className="font-semibold">{ticker.symbol}</span>
                  <span className="text-right tabular-nums">
                    {formatNumber(ticker.lastPrice, {
                      maximumFractionDigits: 8,
                    })}
                  </span>
                  <span className={`text-right tabular-nums ${changeClass}`}>
                    {formatPercent(ticker.priceChangePercent)}
                  </span>
                </Link>
              );
            })
          : null}
      </div>
    </main>
  );
}
