"use client";

import { getDepth } from "@/app/utils/hits";
import { sigManager } from "@/app/utils/realtiime";
import { BookTicker, depth } from "@/app/utils/types";
import { useEffect, useState } from "react";

type OrderbookProps = {
  market: string;
};

type OrderbookLevel = [price: string, quantity: string];

const MAX_VISIBLE_LEVELS = 12;

const sortAsks = (levels: OrderbookLevel[]) => {
  return [...levels].sort((a, b) => Number(a[0]) - Number(b[0]));
};

const sortBids = (levels: OrderbookLevel[]) => {
  return [...levels].sort((a, b) => Number(b[0]) - Number(a[0]));
};

const applyDepthUpdates = (
  currentLevels: OrderbookLevel[],
  updates: OrderbookLevel[] = [],
  sortLevels: (levels: OrderbookLevel[]) => OrderbookLevel[],
) => {
  const levelsByPrice = new Map(currentLevels);

  updates.forEach(([price, quantity]) => {
    if (Number(quantity) === 0) {
      levelsByPrice.delete(price);
      return;
    }

    levelsByPrice.set(price, quantity);
  });

  return sortLevels([...levelsByPrice.entries()]);
};

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
  const [bookTicker, setBookTicker] = useState<Partial<BookTicker>>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let ignore = false;
    console.info("Orderbook subscribing depth", market);

    sigManager.getInstance().register("depth",  (data: Partial<depth>) => {
      if (!ignore) {
        setAsks((currentAsks) =>
          applyDepthUpdates(currentAsks, data.asks, sortAsks),
        );
        setBids((currentBids) =>
          applyDepthUpdates(currentBids, data.bids, sortBids),
        );
        setError(undefined);
      }
    }, market);
    sigManager.getInstance().register("bookTicker",  (data: Partial<BookTicker>) => {
      if (!ignore) {
        setBookTicker(data);
      }
    }, market);
    sigManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`depth.${market}`, `bookTicker.${market}`],
    });

    getDepth(market)
      .then((depth) => {
        if (!ignore) {
          setAsks(sortAsks(depth.asks));
          setBids(sortBids(depth.bids));
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
      sigManager.getInstance().deregister("depth", market);
      sigManager.getInstance().deregister("bookTicker", market);
      sigManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`depth.${market}`, `bookTicker.${market}`],
      });
    };
  }, [market]);

  const bestAsk = bookTicker?.askPrice ?? asks.at(0)?.[0];
  const bestBid = bookTicker?.bidPrice ?? bids.at(0)?.[0];
  const currentPrice =
    bestAsk && bestBid ? (Number(bestAsk) + Number(bestBid)) / 2 : null;
  const visibleAsks = asks.slice(0, MAX_VISIBLE_LEVELS).reverse();
  const visibleBids = bids.slice(0, MAX_VISIBLE_LEVELS);

  return (
    <section className="flex h-full min-h-[300px] w-full max-w-[360px] flex-col rounded-lg border border-[#20212a] bg-[#101116] text-sm text-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#20212a] px-3 py-2">
        <h2 className="text-sm font-semibold text-white">Order Book</h2>
        <span className="text-xs uppercase text-slate-500">{market}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-[#20212a] px-3 py-1.5 text-[11px] font-medium text-slate-500">
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
          <OrderbookSide levels={visibleAsks} side="ask" />

          <div className="border-y border-[#20212a] px-3 py-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Price</span>
              <span className="font-semibold tabular-nums text-white">
                {currentPrice === null ? "--" : formatNumber(String(currentPrice))}
              </span>
            </div>
          </div>

          <OrderbookSide levels={visibleBids} side="bid" />
        </div>
      )}
    </section>
  );
};

const OrderbookSide = ({
  levels,
  side,
}: {
  levels: OrderbookLevel[];
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

  const rowsInTotalOrder = side === "ask" ? [...levels].reverse() : levels;
  const totalsByKey = new Map<string, number>();

  rowsInTotalOrder.reduce((cumulativeTotal, [price, quantity]) => {
    const nextTotal = cumulativeTotal + Number(quantity);
    totalsByKey.set(`${price}-${quantity}`, nextTotal);
    return nextTotal;
  }, 0);

  const maxTotal = Math.max(...totalsByKey.values(), 1);

  const rows = levels.map<{
    price: string;
    quantity: string;
    total: number;
    width: string;
  }>(([price, quantity]) => {
    const total = totalsByKey.get(`${price}-${quantity}`) ?? Number(quantity);
    const width = `${Math.min((total / maxTotal) * 100, 100)}%`;

    return {
      price,
      quantity,
      total,
      width,
    };
  });

  return (
    <ul className="flex flex-1 flex-col justify-end overflow-hidden py-1">
      {rows.map(({ price, quantity, total, width }) => {
        return (
          <li
            className="relative grid min-h-5 grid-cols-3 items-center gap-2 px-3 text-[11px] tabular-nums"
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
