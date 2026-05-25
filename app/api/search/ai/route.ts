import { NextRequest, NextResponse } from "next/server";
import { runNewsPipeline, searchNewsData } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";
  const result = await runNewsPipeline();

  // Copyright-safe search: answers are grounded only in normalized Flash Feed metadata,
  // AI summaries, source attribution, and original source links. No full article bodies are used.
  const search = searchNewsData(query, result.articles, result.clusters);

  return NextResponse.json({
    updatedAt: result.fetchedAt,
    query,
    answer: search.answer,
    citations: search.articles.map((article) => ({
      title: article.title,
      sourceName: article.sourceName,
      originalUrl: article.originalUrl
    })),
    articles: search.articles,
    clusters: search.clusters
  });
}
