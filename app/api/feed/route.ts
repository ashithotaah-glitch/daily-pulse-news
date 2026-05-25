import { NextRequest, NextResponse } from "next/server";
import { runNewsPipeline, sortArticles } from "@/lib/news";
import type { NewsCategory } from "@/lib/news";

export const revalidate = 600;

const categoryAliases: Record<string, NewsCategory> = {
  tech: "technology",
  markets: "finance",
  politics: "geopolitics"
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category");
  const category = categoryParam ? categoryAliases[categoryParam] || (categoryParam as NewsCategory) : null;
  const sort = searchParams.get("sort") || "ranking";
  const result = await runNewsPipeline();
  const filtered = category ? result.articles.filter((article) => article.category === category) : result.articles;

  return NextResponse.json({
    updatedAt: result.fetchedAt,
    count: filtered.length,
    sort,
    category,
    articles: sortArticles(filtered, sort)
  });
}
