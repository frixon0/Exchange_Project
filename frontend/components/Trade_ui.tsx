"use client";

import { placeOrder } from "@/app/utils/hits";
import { useMemo, useState } from "react";

type MarketChartProps = {
  market: string;
};

const DEFAULT_USER_ID = "1";
const DEFAULT_AVAILABLE = 10_000_000;

const toNumber = (value: string) => {
  const cleaned = value.trim();
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : NaN;
};

const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
  if (!Number.isFinite(value)) {
    return "--";
  }
  return new Intl.NumberFormat("en-US", options).format(value);
};

export const Trade_ui = ({ market }: MarketChartProps) => {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [percent, setPercent] = useState<number>(0);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "success"; message: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const [baseAsset, quoteAsset] = useMemo(() => {
    const [base, quote] = market.split("_");
    return [base || market, quote || "QUOTE"];
  }, [market]);

  const priceNumber = toNumber(price);
  const quantityNumber = toNumber(quantity);
  const orderValue =
    Number.isFinite(priceNumber) && Number.isFinite(quantityNumber)
      ? priceNumber * quantityNumber
      : NaN;

  const isSubmitting = status.kind === "submitting";
  const isValidOrder =
    Number.isFinite(priceNumber) &&
    priceNumber > 0 &&
    Number.isFinite(quantityNumber) &&
    quantityNumber > 0;

  const availableAsset = side === "buy" ? quoteAsset : baseAsset;

  const maxQuantity = useMemo(() => {
    if (side === "sell") {
      return DEFAULT_AVAILABLE;
    }

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      return 0;
    }

    return DEFAULT_AVAILABLE / priceNumber;
  }, [side, priceNumber]);

  const applyPercent = (nextPercent: number) => {
    setPercent(nextPercent);
    if (!Number.isFinite(maxQuantity) || maxQuantity <= 0) {
      setQuantity("");
      return;
    }

    const nextQty = (maxQuantity * nextPercent) / 100;
    const precision = 8;
    setQuantity(nextQty === 0 ? "" : nextQty.toFixed(precision));
  };

  const onSubmit = async () => {
    if (isSubmitting) return;
    if (!isValidOrder) {
      setStatus({ kind: "error", message: "Enter a valid price and quantity" });
      return;
    }

    setStatus({ kind: "submitting" });

    try {
      const result = await placeOrder({
        market,
        side,
        price: priceNumber.toString(),
        quantity: quantityNumber.toString(),
        userId: DEFAULT_USER_ID,
      });

      if (!result.orderId) {
        setStatus({ kind: "error", message: "Order rejected" });
        return;
      }

      const fillsCount = result.fills?.length ?? 0;
      const message = `Order placed (${result.orderId}). Executed: ${formatNumber(result.executedQty, { maximumFractionDigits: 8 })}. Fills: ${fillsCount}`;
      setStatus({ kind: "success", message });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to place order";
      setStatus({ kind: "error", message });
    }
  };

  return (
    <section className="h-full w-full rounded-lg border border-[#20212a] bg-[#101116] p-3 text-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#20212a] pb-2">
        <div>
          <div className="text-sm font-semibold text-white">Order</div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">
            {market}
          </div>
        </div>
        <div className="text-[11px] text-slate-500">User {DEFAULT_USER_ID}</div>
      </div>

      <div className="mt-3 flex gap-2 rounded-lg bg-[#14151b] p-1">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            side === "buy"
              ? "bg-emerald-500/20 text-emerald-200"
              : "bg-[#1f212a] text-slate-200 hover:bg-white/5"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            side === "sell"
              ? "bg-red-500/20 text-red-200"
              : "bg-[#1f212a] text-slate-200 hover:bg-white/5"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="mt-3 flex items-center gap-1 text-sm">
        <button
          type="button"
          className="rounded-md bg-[#1f212a] px-3 py-1.5 text-white"
        >
          Limit
        </button>
        <button
          type="button"
          disabled
          className="rounded-md px-3 py-1.5 text-slate-500"
          title="Market orders not supported yet"
        >
          Market
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="text-slate-400">Available ({availableAsset})</div>
        <div className="tabular-nums text-slate-300">
          {formatNumber(DEFAULT_AVAILABLE, { maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-400">Price ({quoteAsset})</div>
      <div className="mt-2 flex items-center rounded-lg bg-[#1f212a] px-3 py-3">
        <input
          inputMode="decimal"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            setStatus({ kind: "idle" });
          }}
          placeholder="0.0"
          className="w-full bg-transparent text-xl text-white outline-none placeholder:text-slate-600"
        />
        <div className="flex h-7 min-w-7 items-center justify-center rounded-full bg-green-500 px-2 text-[11px] font-bold text-white">
          {quoteAsset}
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-400">Quantity ({baseAsset})</div>
      <div className="mt-2 flex items-center rounded-lg bg-[#1f212a] px-3 py-3">
        <input
          inputMode="decimal"
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            setPercent(0);
            setStatus({ kind: "idle" });
          }}
          placeholder="0"
          className="w-full bg-transparent text-xl text-white outline-none placeholder:text-slate-600"
        />
        <div className="flex h-7 min-w-7 items-center justify-center rounded-full bg-orange-500 px-2 text-[11px] font-bold text-white">
          {baseAsset}
        </div>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={100}
          value={percent}
          onChange={(e) => applyPercent(Number(e.target.value))}
          className="h-0.5 w-full cursor-pointer accent-[#0632f6]"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>{percent}%</span>
          <span>
            Max {formatNumber(maxQuantity, { maximumFractionDigits: 8 })}
          </span>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-400">Order Value ({quoteAsset})</div>
      <div className="mt-2 flex items-center rounded-lg bg-[#1f212a] px-3 py-3">
        <input
          readOnly
          value={Number.isFinite(orderValue) ? orderValue.toFixed(8) : ""}
          placeholder="0"
          className="w-full bg-transparent text-xl text-white outline-none placeholder:text-slate-600"
        />
        <div className="flex h-7 min-w-7 items-center justify-center rounded-full bg-green-500 px-2 text-[11px] font-bold text-white">
          {quoteAsset}
        </div>
      </div>

      {status.kind === "error" ? (
        <div className="mt-3 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {status.message}
        </div>
      ) : null}

      {status.kind === "success" ? (
        <div className="mt-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          {status.message}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!isValidOrder || isSubmitting}
        className={`mt-4 w-full rounded-lg py-3 text-sm font-semibold transition ${
          side === "buy"
            ? "bg-emerald-500 text-black hover:opacity-90 disabled:bg-emerald-500/30 disabled:text-slate-400"
            : "bg-red-500 text-black hover:opacity-90 disabled:bg-red-500/30 disabled:text-slate-400"
        }`}
      >
        {isSubmitting
          ? "Placing order…"
          : side === "buy"
            ? `Place Buy Order`
            : `Place Sell Order`}
      </button>
    </section>
  );
};