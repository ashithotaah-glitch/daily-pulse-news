export type {
  AIEnrichment,
  ImpactLevel,
  NewsCategory,
  NewsPipelineResult,
  Sentiment,
  SourceConfig,
  StandardArticle as NewsItem,
  StoryCluster,
  TopicSummary
} from "./news/types";
export { categories, sourceConfigs } from "./news/source-config";
export { categoryImages } from "./news/images";
export { runNewsPipeline, sortArticles } from "./news/processing";

import { categoryImages } from "./news/images";
import { runNewsPipeline } from "./news/processing";
import type { NewsCategory, StandardArticle } from "./news/types";

export async function getNews() {
  const result = await runNewsPipeline();
  return result.articles;
}

export async function getClusters() {
  const result = await runNewsPipeline();
  return result.clusters;
}

export async function getTopics() {
  const result = await runNewsPipeline();
  return result.topics;
}

export function getFeatured(items: StandardArticle[]) {
  return items[0];
}

export function getCategoryImage(category: NewsCategory) {
  return categoryImages[category];
}
