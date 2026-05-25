import { NextRequest, NextResponse } from "next/server";
import { runNewsPipeline } from "@/lib/news";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (secret && authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runNewsPipeline();

  return NextResponse.json({
    ok: true,
    refreshedAt: new Date().toISOString(),
    capturedStories: result.articles.length,
    clusters: result.clusters.length,
    categories: [...new Set(result.articles.map((item) => item.category))]
  });
}
