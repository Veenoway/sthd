import { fetchTokens } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "40");
  const cursor = searchParams.get("cursor");
  const chain = searchParams.get("chain");
  try {
    const data = await fetchTokens(
      Number.isFinite(limit) ? Math.min(limit, 80) : 40,
      cursor,
      chain,
    );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Feed error" },
      { status: 502 },
    );
  }
}
