"use client"

import { getticker } from "@/app/utils/hits";
import { Ticker } from "@/app/utils/types";
import { useEffect, useState } from "react";

type MarketbarProps = {
  market: string;
};

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

export const Marketbar = ({ market }: MarketbarProps) => {
  const [tickerState, setTickerState] = useState<{
    data?: Ticker;
    error?: string;
    market?: string;
  }>({});

  useEffect(() => {
    let ignore = false;

    getticker(market)
      .then((data) => {
        if (!ignore) {
          setTickerState({ data, market });
        }
      })
      .catch(() => {
        if (!ignore) {
          setTickerState({ error: "Ticker unavailable", market });
        }
      });

    return () => {
      ignore = true;
    };
  }, [market]);

  const tickerData =
    tickerState.market === market ? tickerState.data : undefined;
  const error = tickerState.market === market ? tickerState.error : undefined;
  const isLoading = tickerState.market !== market && !error;
  const priceChange = Number(tickerData?.priceChange);
  const isPositive = Number.isFinite(priceChange) && priceChange >= 0;
  const changeClass = isPositive ? "text-emerald-400" : "text-red-400";

  return (
    <div className="flex min-h-[66px] w-full items-center gap-6 overflow-x-auto rounded-lg border border-[#20212a] bg-[#14151b] px-4 py-3 shadow-sm">
      <div className="min-w-[150px] shrink-0">
        <div className="text-sm font-semibold uppercase tracking-wide text-white">
          {tickerData?.symbol ?? market}
        </div>
        <div className="mt-1 text-xl font-bold tabular-nums text-white">
          {isLoading
            ? "--"
            : formatNumber(tickerData?.lastPrice, {
                maximumFractionDigits: 8,
              })}
        </div>
      </div>

      {error ? (
        <div className="text-sm text-red-300">{error}</div>
      ) : (
        <div className="flex min-w-max items-center gap-6">
          <TickerStat
            label="24h Change"
            value={formatPercent(tickerData?.priceChangePercent)}
            valueClassName={changeClass}
          />
          <TickerStat
            label="24h High"
            value={formatNumber(tickerData?.high, { maximumFractionDigits: 8 })}
          />
          <TickerStat
            label="24h Low"
            value={formatNumber(tickerData?.low, { maximumFractionDigits: 8 })}
          />
          <TickerStat
            label="24h Volume"
            value={formatNumber(tickerData?.volume, {
              maximumFractionDigits: 2,
            })}
          />
          <TickerStat
            label="Quote Volume"
            value={formatNumber(tickerData?.quoteVolume, {
              maximumFractionDigits: 2,
            })}
          />
          <TickerStat label="Trades" value={formatNumber(tickerData?.trades)} />
        </div>
      )}
    </div>
  );
};

const TickerStat = ({
  label,
  value,
  valueClassName = "text-white",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) => {
  return (
    <div className="shrink-0">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`mt-1 text-sm font-semibold tabular-nums ${valueClassName}`}>
        {value}
      </div>
    </div>
  );
};
