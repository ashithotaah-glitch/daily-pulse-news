export type NewsCategory =
  | "top"
  | "technology"
  | "business"
  | "finance"
  | "geopolitics"
  | "entertainment"
  | "sports"
  | "science"
  | "health"
  | "world";

export type ImpactLevel = "low" | "medium" | "high";
export type Sentiment = "negative" | "neutral" | "positive";
export type SourceAdapterType = "google-news-rss" | "generic-rss" | "future-api";

export type SourceConfig = {
  id: string;
  name: string;
  adapter: SourceAdapterType;
  homepage: string;
  url: string;
  category: NewsCategory;
  region?: string;
  language?: string;
  credibility?: number;
  image?: string;
  limit?: number;
  enabled?: boolean;
};

export type RawArticle = {
  title: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  sourceLogo: string;
  originalUrl: string;
  canonicalUrl: string;
  imageUrl: string;
  category: NewsCategory;
  region: string;
  language: string;
  publishedAt: string;
  fetchedAt: string;
  author: string;
};

export type StandardArticle = RawArticle & {
  id: string;
  normalizedTitle: string;
  aiSummary: string;
  whyItMatters: string;
  keyPoints: string[];
  tags: string[];
  entities: {
    people: string[];
    companies: string[];
    countries: string[];
    products: string[];
    organizations: string[];
    events: string[];
    industries: string[];
  };
  sentiment: Sentiment;
  impactLevel: ImpactLevel;
  clusterId: string;
  duplicateOf: string | null;
  trendScore: number;
  rankingScore: number;
};

export type StoryCluster = {
  clusterId: string;
  mainHeadline: string;
  aiSummary: string;
  whyItMatters: string;
  keyPoints: string[];
  primaryArticle: StandardArticle;
  relatedArticles: StandardArticle[];
  sources: string[];
  sourcesCount: number;
  latestPublishedAt: string;
  category: NewsCategory;
  entities: StandardArticle["entities"];
  sentiment: Sentiment;
  impactLevel: ImpactLevel;
  trendScore: number;
};

export type TopicSummary = {
  name: string;
  count: number;
  categories: NewsCategory[];
  trendScore: number;
};

export type NewsPipelineResult = {
  articles: StandardArticle[];
  clusters: StoryCluster[];
  topics: TopicSummary[];
  sources: SourceConfig[];
  fetchedAt: string;
};

export type AIEnrichment = {
  aiSummary: string;
  whyItMatters: string;
  keyPoints: string[];
  tags: string[];
  entities: StandardArticle["entities"];
  sentiment: Sentiment;
  impactLevel: ImpactLevel;
};

