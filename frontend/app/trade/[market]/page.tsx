"use client"

import { Marketbar } from "@/components/Marketbar";
import { useParams } from "next/navigation";

export default function Page() {
  const { market } = useParams<{ market: string }>();
  const marketSymbol = decodeURIComponent(market).replaceAll("-", "_").toUpperCase();

  return <Marketbar market={marketSymbol} />;
}
