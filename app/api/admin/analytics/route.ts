import { NextResponse } from "next/server";
import { readAdminStore } from "@/lib/admin/store";

function topCounts(events: { label: string }[]) {
  const counts = new Map<string, number>();
  events.forEach((event) => counts.set(event.label, (counts.get(event.label) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([label, count]) => ({ label, count }));
}

export async function GET() {
  const store = await readAdminStore();
  return NextResponse.json({
    events: store.events.slice(0, 200),
    topViewedArticles: topCounts(store.events.filter((event) => event.type === "article_view")),
    topClickedSources: topCounts(store.events.filter((event) => event.type === "source_click")),
    topCategories: topCounts(store.events.filter((event) => event.type === "category_click")),
    topSearchQueries: topCounts(store.events.filter((event) => event.type === "search_query")),
    savedStoryCounts: store.events.filter((event) => event.type === "save_story").length,
    personalizedFeedUsage: store.events.filter((event) => event.type === "personalized_feed").length,
    aiSearchUsage: store.events.filter((event) => event.type === "search_query").length
  });
}
