"use client";

import { getklines } from "@/app/utils/hits";
import { ChartManager } from "@/app/utils/graph";
import { KLine } from "@/app/utils/types";
import { useEffect, useMemo, useRef, useState } from "react";

type MarketChartProps = {
  market: string;
};

const DAYS_TO_LOAD = 7;

const toUnixSeconds = (date: Date) => {
  return Math.floor(date.getTime() / 1000).toString();
};

const toChartCandles = (klines: KLine[]) => {
  return klines
    .map((kline) => ({
      timestamp: Date.parse(kline.start),
      open: Number(kline.open),
      high: Number(kline.high),
      low: Number(kline.low),
      close: Number(kline.close),
    }))
    .filter((candle) => {
      return (
        Number.isFinite(candle.timestamp) &&
        Number.isFinite(candle.open) &&
        Number.isFinite(candle.high) &&
        Number.isFinite(candle.low) &&
        Number.isFinite(candle.close)
      );
    });
};

export const MarketChart = ({ market }: MarketChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartManagerRef = useRef<ChartManager | null>(null);
  const [chartState, setChartState] = useState<{
    klines: KLine[];
    market?: string;
    status: "ready" | "error";
  }>({ klines: [], status: "error" });

  useEffect(() => {
    let ignore = false;
    const end = new Date();
    const start = new Date(end.getTime() - DAYS_TO_LOAD * 24 * 60 * 60 * 1000);

    getklines(toUnixSeconds(start), toUnixSeconds(end), market)
      .then((data) => {
        if (!ignore) {
          setChartState({
            klines: data,
            market,
            status: data.length > 0 ? "ready" : "error",
          });
        }
      })
      .catch(() => {
        if (!ignore) {
          setChartState({ klines: [], market, status: "error" });
        }
      });

    return () => {
      ignore = true;
    };
  }, [market]);

  const klines = useMemo(() => {
    return chartState.market === market ? chartState.klines : [];
  }, [chartState, market]);
  const status =
    chartState.market === market ? chartState.status : "loading";

  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    const candles = toChartCandles(klines);

    if (!chartContainer || candles.length === 0) {
      return;
    }

    chartManagerRef.current?.destroy();
    chartManagerRef.current = new ChartManager(chartContainer, candles, {
      background: "#101116",
      color: "#d7dde8",
    });

    return () => {
      chartManagerRef.current?.destroy();
      chartManagerRef.current = null;
    };
  }, [klines]);

  return (
    <section className="flex h-full min-h-[360px] min-w-0 flex-col rounded-lg border border-[#20212a] bg-[#101116] shadow-sm">
      <div className="flex items-center justify-between border-b border-[#20212a] px-3 py-2">
        <h2 className="text-sm font-semibold text-white">Chart</h2>
        <span className="text-xs uppercase text-slate-500">1H</span>
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={chartContainerRef} className="absolute inset-0" />

        {status !== "ready" ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
            {status === "loading" ? "Loading chart" : "Chart unavailable"}
          </div>
        ) : null}
      </div>
    </section>
  );
};
