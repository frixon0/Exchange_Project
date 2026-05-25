import React from "react";

type MarketChartProps = {
  market: string;
};

export const Trade_ui = ({ market: _market }: MarketChartProps) => {
  void _market;
  return (
    <div className="h-full w-full rounded-lg border border-[#20212a] bg-[#101116] p-2 shadow-sm">
      <div className="flex rounded-lg border-[#20212a] bg-[#101116] gap-2 p-1">
        <button className="flex-1 rounded-lg cursor-pointer bg-[#1f212a] py-2 text-sm font-semibold text-white-400 hover:bg-green-700">
          Buy
        </button>

        <button className="flex-1 rounded-lg cursor-pointer bg-[#1f212a] py-2 text-sm font-semibold text-white-400 hover:bg-red-700">
          Sell
        </button>
      </div>
      

      <div className="mt-3 flex items-center gap-1 text-sm">
        <button className="rounded-md cursor-pointer bg-[#1f212a] px-3 py-1.5 text-white">
          Limit
        </button>

        <button className="px-3 py-1.5 cursor-pointer hover:bg-[#1f212a]  rounded-md text-white">
          Market
        </button>

       
      </div>

      <div className="mt-4 text-xs text-slate-400">
        Balance
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-400">Price</span>

        <div className="flex gap-2 text-blue-400 ">
          <button className="cursor-pointer">Mid</button>
          <button className="cursor-pointer">BBO</button>
        </div>
      </div>

      <div className="mt-2 flex items-center rounded-lg bg-[#1f212a] px-3 py-3">
        <input
          type="text"
          defaultValue="0.0"
          className="w-full bg-transparent text-xl text-white outline-none"
        />

        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-sm text-white font-bold">
          $
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-400">
        Quantity
      </div>

      <div className="mt-2 flex items-center rounded-lg bg-[#1f212a] px-3 py-3">
        <input
          type="text"
          defaultValue="0"
          className="w-full bg-transparent text-xl text-white outline-none"
        />

        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm text-white font-bold">
          ₿
        </div>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min="0"
          
          max="100"
          className="w-full h-0.5 cursor-pointer accent-[#0632f6]"
        />

        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>0</span>
          <span>100%</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-400">
        Order Value
      </div>

      <div className="mt-2 flex items-center rounded-lg bg-[#1f212a] px-3 py-3">
        <input
          type="text"
          defaultValue="0"
          className="w-full bg-transparent text-xl text-white outline-none"
        />

        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-sm text-white font-bold">
          $
        </div>
      </div>

      <button className="mt-5 w-full rounded-lg cursor-pointer bg-white py-3 text-sm font-semibold text-black transition hover:opacity-90">
        Sign up to trade
      </button>

      <button className="mt-3 w-full rounded-lg cursor-pointer bg-[#1a1f30] py-3 text-sm font-semibold text-white transition hover:bg-[#22283c]">
        Log in to trade
      </button>

      <div className="mt-4 flex gap-4 text-xs text-slate-400">
        <label className="flex items-center gap-1">
          <input type="checkbox" />
          Post Only
        </label>

        <label className="flex items-center gap-1">
          <input type="checkbox" />
          IOC
        </label>
      </div>
    </div>
  );
};