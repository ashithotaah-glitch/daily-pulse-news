import { NextResponse } from "next/server";
import { runNewsPipeline } from "@/lib/news";

export const revalidate = 600;

export async function GET() {
  const result = await runNewsPipeline();
  const sourceStats = result.sources.map((source) => ({
    ...source,
    articlesCount: result.articles.filter((article) => article.sourceName === source.name).length
  }));

  return NextResponse.json({
    updatedAt: result.fetchedAt,
    count: sourceStats.length,
    sources: sourceStats
  });
}
