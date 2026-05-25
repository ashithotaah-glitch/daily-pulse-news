import { NextResponse } from "next/server";
import { buildLiveSnapshot, runNewsPipeline } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await runNewsPipeline();
  return NextResponse.json(buildLiveSnapshot(result));
}
