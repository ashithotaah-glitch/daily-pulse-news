import { NextRequest, NextResponse } from "next/server";
import { parseReaderProfile, personalizeArticles, runNewsPipeline, sortArticles } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profile = parseReaderProfile(searchParams.get("profile"));
  const result = await runNewsPipeline();
  const fallback = sortArticles(result.articles, "trending");
  const articles = profile.categories.length || profile.topics.length || profile.saved.length || profile.history.length
    ? personalizeArticles(result.articles, profile)
    : fallback;

  return NextResponse.json({
    updatedAt: result.fetchedAt,
    count: articles.length,
    personalized: articles !== fallback,
    articles
  });
}
