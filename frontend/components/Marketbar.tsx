"use client"

import { getticker } from "@/app/utils/hits";
import { sigManager } from "@/app/utils/realtiime";
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
    data?: Partial<Ticker>;
    error?: string;
    market?: string;
  }>({});

  useEffect(() => {
    let ignore = false;
    console.info("Marketbar subscribing ticker", market);

    sigManager.getInstance().register("ticker",  (data: Partial<Ticker>) => {
      if (!ignore) {
       setTickerState((prevState) => {
          return { ...prevState, market, data: { ...prevState.data, ...data } };
        });
      }
    }, market); 
    sigManager.getInstance().register("trade",  (data: Partial<Ticker>) => {
      if (!ignore) {
       setTickerState((prevState) => {
          return { ...prevState, market, data: { ...prevState.data, ...data } };
        });
      }
    }, market); 
    sigManager.getInstance().sendMessage({
      "method": "SUBSCRIBE",
      "params": [`ticker.${market}`, `trade.${market}`]
    });
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
      sigManager.getInstance().deregister("ticker", market);
      sigManager.getInstance().deregister("trade", market);
      sigManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`ticker.${market}`, `trade.${market}`],
       
      });
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
    <div className="flex min-h-12 w-full items-center gap-5 overflow-x-auto rounded-lg border border-[#20212a] bg-[#14151b] px-3 py-2 shadow-sm">
      <div className="min-w-32 shrink-0">
        <div className="text-xs font-semibold uppercase tracking-wide text-white">
          {tickerData?.symbol ?? market}
        </div>
        <div className="text-lg font-bold tabular-nums text-white">
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
        <div className="flex min-w-max  items-center gap-5">
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
      <div className="text-[11px] leading-3 text-slate-400">{label}</div>
      <div className={`mt-0.5 text-xs font-semibold tabular-nums ${valueClassName}`}>
        {value}
      </div>
    </div>
  );
};
