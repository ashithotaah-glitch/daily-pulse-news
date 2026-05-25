import { sortArticles } from "./processing";
import type { NewsPipelineResult, StandardArticle, StoryCluster, TopicSummary } from "./types";

export type LiveTrend = {
  name: string;
  score: number;
  velocity: number;
  sentiment: StandardArticle["sentiment"];
  sourcesCount: number;
};

export type LiveSnapshot = {
  updatedAt: string;
  liveStories: StandardArticle[];
  breakingStories: StandardArticle[];
  ticker: string[];
  clusters: StoryCluster[];
  trends: LiveTrend[];
};

const snapshotCache: { key: string; value: LiveSnapshot } = {
  key: "",
  value: {
    updatedAt: "",
    liveStories: [],
    breakingStories: [],
    ticker: [],
    clusters: [],
    trends: []
  }
};

function ageHours(article: StandardArticle) {
  return Math.max(0, (Date.now() - Date.parse(article.publishedAt)) / 3600000);
}

function sourceVelocity(cluster: StoryCluster) {
  const recency = Math.max(0, 12 - ageHours(cluster.primaryArticle));
  return Math.round(cluster.sourcesCount * 12 + cluster.relatedArticles.length * 7 + recency * 4);
}

function topicTrend(topic: TopicSummary, result: NewsPipelineResult): LiveTrend {
  const related = result.articles.filter((article) => {
    const values = [
      ...article.tags,
      ...article.entities.people,
      ...article.entities.companies,
      ...article.entities.countries,
      ...article.entities.products,
      ...article.entities.organizations,
      ...article.entities.events,
      ...article.entities.industries
    ];
    return values.some((value) => value.toLowerCase() === topic.name.toLowerCase());
  });
  const sourcesCount = new Set(related.map((article) => article.sourceName)).size;
  const positive = related.filter((article) => article.sentiment === "positive").length;
  const negative = related.filter((article) => article.sentiment === "negative").length;

  return {
    name: topic.name,
    score: topic.trendScore,
    velocity: Math.round(topic.count * 8 + sourcesCount * 10 + Math.max(0, 12 - Math.min(...related.map(ageHours), 12)) * 3),
    sentiment: positive > negative ? "positive" : negative > positive ? "negative" : "neutral",
    sourcesCount
  };
}

export function isBreakingStory(article: StandardArticle, sourcesCount = 1) {
  const fresh = ageHours(article) <= 3;
  const highImpact = article.impactLevel === "high" || article.trendScore >= 76;
  const multiSource = sourcesCount >= 2;
  return fresh && highImpact && (multiSource || article.trendScore >= 84);
}

export function buildLiveSnapshot(result: NewsPipelineResult): LiveSnapshot {
  const key = `${result.fetchedAt}:${result.articles[0]?.id || ""}:${result.clusters[0]?.clusterId || ""}`;
  if (snapshotCache.key === key) return snapshotCache.value;

  const clustersById = new Map(result.clusters.map((cluster) => [cluster.clusterId, cluster]));
  const liveStories = sortArticles(result.articles, "latest").slice(0, 12);
  const breakingStories = liveStories.filter((article) => isBreakingStory(article, clustersById.get(article.clusterId)?.sourcesCount || 1)).slice(0, 5);
  const ticker = sortArticles(result.articles, "trending")
    .slice(0, 8)
    .map((article) => `${article.category.replace("-", " ")} / ${article.title}`);
  const clusterTrends = result.clusters.slice(0, 8).map((cluster) => ({
    name: cluster.mainHeadline,
    score: cluster.trendScore,
    velocity: sourceVelocity(cluster),
    sentiment: cluster.sentiment,
    sourcesCount: cluster.sourcesCount
  }));
  const topicTrends = result.topics.slice(0, 12).map((topic) => topicTrend(topic, result));

  snapshotCache.key = key;
  snapshotCache.value = {
    updatedAt: result.fetchedAt,
    liveStories,
    breakingStories,
    ticker,
    clusters: result.clusters.slice(0, 8),
    trends: [...clusterTrends, ...topicTrends].sort((a, b) => b.velocity - a.velocity || b.score - a.score).slice(0, 12)
  };

  return snapshotCache.value;
}
