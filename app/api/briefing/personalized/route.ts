import { NextRequest, NextResponse } from "next/server";
import { getPersonalizedBriefing, parseReaderProfile, runNewsPipeline } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profile = parseReaderProfile(searchParams.get("profile"));
  const result = await runNewsPipeline();

  return NextResponse.json(getPersonalizedBriefing(result.articles, profile, result.fetchedAt));
}
