import { NextRequest, NextResponse } from "next/server";
import { getNews } from "@/lib/news";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (secret && authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const news = await getNews();

  return NextResponse.json({
    ok: true,
    refreshedAt: new Date().toISOString(),
    capturedStories: news.length,
    categories: [...new Set(news.map((item) => item.category))]
  });
}
