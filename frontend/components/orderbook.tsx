"use client";

import { getDepth } from "@/app/utils/hits";
import { useEffect, useMemo, useState } from "react";

type OrderbookProps = {
  market: string;
};

type OrderbookLevel = [price: string, quantity: string];

const MAX_VISIBLE_LEVELS = 12;

const formatNumber = (value: string, maximumFractionDigits = 8) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(number);
};

export const Orderbook = ({ market }: OrderbookProps) => {
  const [asks, setAsks] = useState<OrderbookLevel[]>([]);
  const [bids, setBids] = useState<OrderbookLevel[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let ignore = false;

    getDepth(market)
      .then((depth) => {
        if (!ignore) {
          setAsks(depth.asks.slice(0, MAX_VISIBLE_LEVELS).reverse());
          setBids(depth.bids.slice(0, MAX_VISIBLE_LEVELS));
          setError(undefined);
        }
      })
      .catch(() => {
        if (!ignore) {
          setAsks([]);
          setBids([]);
          setError("Orderbook unavailable");
        }
      });

    return () => {
      ignore = true;
    };
  }, [market]);

  const maxQuantity = useMemo(() => {
    const quantities = [...asks, ...bids].map((level) => Number(level[1]));
    return Math.max(...quantities.filter(Number.isFinite), 1);
  }, [asks, bids]);

  const bestAsk = asks.at(-1)?.[0];
  const bestBid = bids.at(0)?.[0];
  const spread =
    bestAsk && bestBid ? Math.max(Number(bestAsk) - Number(bestBid), 0) : null;

  return (
    <section className="flex h-full min-h-[520px] w-full max-w-[360px] flex-col rounded-lg border border-[#20212a] bg-[#101116] text-sm text-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#20212a] px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Order Book</h2>
        <span className="text-xs uppercase text-slate-500">{market}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-[#20212a] px-4 py-2 text-xs font-medium text-slate-500">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {error ? (
        <div className="flex flex-1 items-center justify-center px-4 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <OrderbookSide
            levels={asks}
            maxQuantity={maxQuantity}
            side="ask"
          />

          <div className="border-y border-[#20212a] px-4 py-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Spread</span>
              <span className="font-semibold tabular-nums text-white">
                {spread === null ? "--" : formatNumber(String(spread))}
              </span>
            </div>
          </div>

          <OrderbookSide
            levels={bids}
            maxQuantity={maxQuantity}
            side="bid"
          />
        </div>
      )}
    </section>
  );
};

const OrderbookSide = ({
  levels,
  maxQuantity,
  side,
}: {
  levels: OrderbookLevel[];
  maxQuantity: number;
  side: "ask" | "bid";
}) => {
  const colorClass = side === "bid" ? "text-emerald-400" : "text-red-400";
  const barClass = side === "bid" ? "bg-emerald-500/10" : "bg-red-500/10";

  if (levels.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-xs text-slate-500">
        Loading levels
      </div>
    );
  }

  return (
    <ul className="flex flex-1 flex-col justify-end overflow-hidden py-1">
      {levels.map(([price, quantity]) => {
        const total = Number(price) * Number(quantity);
        const width = `${Math.min((Number(quantity) / maxQuantity) * 100, 100)}%`;

        return (
          <li
            className="relative grid min-h-7 grid-cols-3 items-center gap-2 px-4 text-xs tabular-nums"
            key={`${side}-${price}-${quantity}`}
          >
            <div
              className={`absolute inset-y-0 right-0 ${barClass}`}
              style={{ width }}
            />
            <span className={`relative font-medium ${colorClass}`}>
              {formatNumber(price)}
            </span>
            <span className="relative text-right text-slate-200">
              {formatNumber(quantity, 5)}
            </span>
            <span className="relative text-right text-slate-400">
              {formatNumber(String(total), 2)}
            </span>
          </li>
        );
      })}
    </ul>
  );
};
