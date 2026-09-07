import { isChartRange, isTokenAddress } from "@/lib/market";
import { fetchTokenTape } from "@/lib/tape";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chain = searchParams.get("chain") ?? "";
  const address = searchParams.get("address") ?? "";
  const rangeParam = searchParams.get("range") ?? "1d";
  const range = isChartRange(rangeParam) ? rangeParam : "1d";

  if (!chain || !isTokenAddress(address)) {
    return NextResponse.json({ ok: false, error: "Bad token" }, { status: 400 });
  }

  try {
    const tape = await fetchTokenTape({ chain, address, range });
    return NextResponse.json({ ok: true, ...tape });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Chart error" },
      { status: 502 },
    );
  }
}
