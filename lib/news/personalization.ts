import { sortArticles } from "./processing";
import type { NewsCategory, StandardArticle, StoryCluster } from "./types";
import { keywordSet, normalizedTitle } from "./utils";

export type SavedStorySnapshot = {
  articleId?: string;
  clusterId?: string;
  title: string;
  source: string;
  savedAt: string;
};

export type ReadingEvent = {
  articleId?: string;
  clusterId?: string;
  category?: NewsCategory;
  source?: string;
  topic?: string;
  openedAt: string;
};

export type ReaderProfile = {
  categories: NewsCategory[];
  topics: string[];
  saved: SavedStorySnapshot[];
  history: ReadingEvent[];
};

export type PersonalizedBriefing = {
  updatedAt: string;
  briefing: string;
  topStories: StandardArticle[];
  keyPoints: string[];
  whyItMatters: string;
  whatToWatchNext: string[];
};

const briefingCache = new Map<string, { expiresAt: number; value: PersonalizedBriefing }>();
const BRIEFING_TTL_MS = 30 * 60 * 1000;

export function emptyReaderProfile(): ReaderProfile {
  return {
    categories: [],
    topics: [],
    saved: [],
    history: []
  };
}

export function parseReaderProfile(value: string | null): ReaderProfile {
  if (!value) return emptyReaderProfile();

  try {
    const parsed = JSON.parse(value) as Partial<ReaderProfile>;
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      topics: Array.isArray(parsed.topics) ? parsed.topics.filter(Boolean).slice(0, 30) : [],
      saved: Array.isArray(parsed.saved) ? parsed.saved.slice(0, 100) : [],
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 200) : []
    };
  } catch {
    return emptyReaderProfile();
  }
}

export function hasPersonalization(profile: ReaderProfile) {
  return Boolean(profile.categories.length || profile.topics.length || profile.saved.length || profile.history.length);
}

function impactBoost(article: StandardArticle) {
  if (article.impactLevel === "high") return 14;
  if (article.impactLevel === "medium") return 8;
  return 3;
}

function recencyBoost(article: StandardArticle) {
  const ageHours = Math.max(0, (Date.now() - Date.parse(article.publishedAt)) / 3600000);
  return Math.max(0, 18 - ageHours * 0.65);
}

function profileTopicTerms(profile: ReaderProfile) {
  const historyTopics = profile.history.flatMap((item) => [item.topic, item.category, item.source]).filter(Boolean) as string[];
  const savedTitles = profile.saved.map((item) => item.title);
  return new Set([...profile.topics, ...historyTopics, ...savedTitles].flatMap((item) => [...keywordSet(item)]));
}

export function personalizeArticles(articles: StandardArticle[], profile: ReaderProfile) {
  if (!hasPersonalization(profile)) return sortArticles(articles, "trending");

  const topicTerms = profileTopicTerms(profile);
  const savedIds = new Set(profile.saved.flatMap((item) => [item.articleId, item.clusterId]).filter(Boolean));
  const clickedSources = new Set(profile.history.map((item) => item.source).filter(Boolean));
  const clickedCategories = new Set(profile.history.map((item) => item.category).filter(Boolean));

  return [...articles]
    .map((article) => {
      const articleTerms = keywordSet(`${article.title} ${article.aiSummary} ${article.tags.join(" ")} ${article.sourceName}`);
      const topicMatches = [...topicTerms].filter((term) => articleTerms.has(term)).length;
      const categoryScore = profile.categories.includes(article.category) ? 34 : clickedCategories.has(article.category) ? 14 : 0;
      const savedScore = savedIds.has(article.id) || savedIds.has(article.clusterId) ? 22 : 0;
      const sourceScore = clickedSources.has(article.sourceName) ? 8 : 0;

      return {
        article,
        score:
          article.trendScore * 0.34 +
          article.rankingScore * 0.28 +
          categoryScore +
          topicMatches * 7 +
          savedScore +
          sourceScore +
          recencyBoost(article) +
          impactBoost(article)
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.article);
}

function searchScore(article: StandardArticle, queryTerms: Set<string>) {
  const textTerms = keywordSet(
    `${article.title} ${article.aiSummary} ${article.whyItMatters} ${article.tags.join(" ")} ${article.sourceName} ${article.category}`
  );
  const matches = [...queryTerms].filter((term) => textTerms.has(term)).length;
  const titleMatches = [...queryTerms].filter((term) => normalizedTitle(article.title).includes(term)).length;
  return matches * 8 + titleMatches * 12 + article.trendScore * 0.1 + recencyBoost(article) * 0.2;
}

export function searchNewsData(query: string, articles: StandardArticle[], clusters: StoryCluster[]) {
  const queryTerms = keywordSet(query);
  if (!queryTerms.size) {
    return {
      answer: "Enter a topic, company, country, person, or event to search Flash Feed's current news data.",
      articles: [],
      clusters: []
    };
  }

  const articleMatches = [...articles]
    .map((article) => ({ article, score: searchScore(article, queryTerms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.article);

  const clusterMatches = clusters
    .filter((cluster) => articleMatches.some((article) => article.clusterId === cluster.clusterId))
    .slice(0, 5);

  const answer = articleMatches.length
    ? `Based on Flash Feed's current aggregated stories, ${articleMatches[0].title} is the strongest match. Related coverage includes ${articleMatches
        .slice(0, 3)
        .map((article) => `${article.sourceName}: ${article.aiSummary}`)
        .join(" ")}`
    : "No strong match was found in Flash Feed's current aggregated news data.";

  return {
    answer,
    articles: articleMatches,
    clusters: clusterMatches
  };
}

function profileCacheKey(profile: ReaderProfile) {
  return JSON.stringify({
    categories: profile.categories.slice().sort(),
    topics: profile.topics.slice(0, 10).sort(),
    saved: profile.saved.map((item) => item.articleId || item.clusterId || item.title).slice(0, 25),
    history: profile.history.map((item) => `${item.category}:${item.topic}:${item.source}`).slice(-40)
  });
}

export function getPersonalizedBriefing(articles: StandardArticle[], profile: ReaderProfile, updatedAt: string): PersonalizedBriefing {
  const cacheKey = profileCacheKey(profile);
  const cached = briefingCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const topStories = personalizeArticles(articles, profile).slice(0, 5);
  const leading = topStories[0];
  const value: PersonalizedBriefing = {
    updatedAt,
    topStories,
    briefing: leading
      ? `Your Flash Feed briefing leads with ${leading.title}. The mix is weighted by your interests, saved stories, reading history, recency, and trend strength.`
      : "Flash Feed is still collecting enough stories to build your personalized briefing.",
    keyPoints: topStories.flatMap((article) => article.keyPoints.slice(0, 1)).slice(0, 5),
    whyItMatters: leading?.whyItMatters || "Personalized briefings help surface the stories most relevant to your current reading patterns.",
    whatToWatchNext: topStories
      .slice(0, 4)
      .map((article) => `${article.category.replace("-", " ")}: ${article.tags.slice(0, 2).join(", ") || article.sourceName}`)
  };

  briefingCache.set(cacheKey, { expiresAt: Date.now() + BRIEFING_TTL_MS, value });
  return value;
}
