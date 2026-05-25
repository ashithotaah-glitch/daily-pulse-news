import type { Metadata } from "next";
import { AdminConsole, type AdminDashboardStats } from "@/components/AdminConsole";
import { categories, runNewsPipeline, sourceConfigs, sortArticles } from "@/lib/news";

export const metadata: Metadata = {
  title: "Flash Feed Admin Console",
  description: "Manage SEO settings, AdSense placements, sponsorship inventory, and monetization tools."
};

export const revalidate = 600;

async function getAdminDashboard(): Promise<AdminDashboardStats> {
  const result = await runNewsPipeline();
  const enabledSources = sourceConfigs.filter((source) => source.enabled !== false);
  const failedSources = enabledSources.filter(
    (source) => !result.articles.some((article) => article.sourceName === source.name && article.category === source.category)
  );
  const topCategories = categories
    .map((category) => ({
      name: category.label,
      count: result.articles.filter((article) => article.category === category.id).length
    }))
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    totalArticles: result.articles.length,
    activeSources: enabledSources.length,
    failedSources: failedSources.length,
    failedSourceNames: failedSources.map((source) => source.id).slice(0, 6),
    aiSummariesGenerated: result.articles.filter((article) => Boolean(article.aiSummary)).length,
    totalUsers: 0,
    savedArticles: 0,
    topCategories,
    trendingStories: sortArticles(result.articles, "trending")
      .slice(0, 6)
      .map((article) => ({
        title: article.title,
        source: article.sourceName,
        trendScore: article.trendScore
      })),
    adRevenuePlaceholder: "₹0.00"
  };
}

export default async function AdminPage() {
  const dashboard = await getAdminDashboard();

  return (
    <main className="admin-page">
      <AdminConsole dashboard={dashboard} />
    </main>
  );
}
