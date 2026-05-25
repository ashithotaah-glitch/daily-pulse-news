import { NextResponse } from "next/server";
import { runNewsPipeline, sortArticles } from "@/lib/news";

export const revalidate = 600;

export async function GET() {
  const result = await runNewsPipeline();
  const topStories = sortArticles(result.articles, "trending").slice(0, 10);
  const categoryHighlights = Object.entries(
    topStories.reduce<Record<string, string[]>>((acc, article) => {
      acc[article.category] = [...(acc[article.category] || []), article.title].slice(0, 3);
      return acc;
    }, {})
  ).map(([category, headlines]) => ({ category, headlines }));
  const importantTrends = result.topics.slice(0, 8);

  return NextResponse.json({
    updatedAt: result.fetchedAt,
    dailySummary:
      topStories.length > 0
        ? `Flash Feed is tracking ${topStories.length} major stories across ${categoryHighlights.length} categories, led by ${topStories[0].title}.`
        : "Flash Feed is warming up today's briefing.",
    topStories,
    categoryHighlights,
    importantTrends,
    whatToWatchNext: result.clusters.slice(0, 5).map((cluster) => ({
      headline: cluster.mainHeadline,
      whyItMatters: cluster.whyItMatters,
      sourcesCount: cluster.sourcesCount,
      trendScore: cluster.trendScore
    }))
  });
}
