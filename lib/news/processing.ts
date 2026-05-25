import { fallbackAIEnrichment, generateAIEnrichment } from "./ai";
import { getAdapter } from "./adapters";
import { getCachedAI, getCachedPipeline, getStalePipeline, setCachedAI, setCachedPipeline } from "./cache";
import { sourceConfigs } from "./source-config";
import type { NewsPipelineResult, RawArticle, StandardArticle, StoryCluster, TopicSummary } from "./types";
import { canonicalUrl, faviconForUrl, keywordOverlap, normalizedTitle, titleSignature, variedFallbackImage } from "./utils";
import { scoreArticle } from "./scoring";
import { categories } from "./source-config";

const MIN_LIVE_ITEMS = 8;
const MAX_PIPELINE_ARTICLES = Number(process.env.MAX_PIPELINE_ARTICLES || 72);
const LIVE_AI_ENRICHMENT_LIMIT = Number(process.env.LIVE_AI_ENRICHMENT_LIMIT || 0);

function articleId(article: RawArticle) {
  return `${article.sourceName}-${canonicalUrl(article.canonicalUrl || article.originalUrl)}`.toLowerCase();
}

function sourceFor(article: StandardArticle) {
  return sourceConfigs.find((source) => source.name === article.sourceName && source.category === article.category);
}

async function fetchRawArticles() {
  const enabledSources = sourceConfigs.filter((source) => source.enabled !== false);
  const settled = await Promise.allSettled(
    enabledSources.map(async (source) => {
      const adapter = getAdapter(source);
      return adapter.fetch(source);
    })
  );

  return settled.flatMap((result, index) => {
    if (result.status === "fulfilled") return result.value;
    console.error("[source] fetch failed", enabledSources[index]?.id, result.reason);
    return [];
  });
}

function markDuplicates(articles: StandardArticle[]) {
  const primaries: StandardArticle[] = [];

  for (const article of articles) {
    const urlKey = canonicalUrl(article.canonicalUrl || article.originalUrl);
    const titleKey = titleSignature(article.title);
    const duplicate = primaries.find((primary) => {
      const sameUrl = canonicalUrl(primary.canonicalUrl || primary.originalUrl) === urlKey;
      const sameTitle = titleSignature(primary.title) === titleKey;
      const overlap = keywordOverlap(primary.title, article.title);
      return sameUrl || sameTitle || overlap >= 0.82;
    });

    article.duplicateOf = duplicate?.id ?? null;
    primaries.push(duplicate ?? article);
  }

  return articles;
}

function clusterArticles(articles: StandardArticle[]) {
  const clusters: StandardArticle[][] = [];

  for (const article of articles) {
    const existing = clusters.find((cluster) => {
      const primary = cluster[0];
      return (
        primary.category === article.category &&
        (keywordOverlap(primary.title, article.title) >= 0.46 ||
          keywordOverlap(primary.normalizedTitle, article.normalizedTitle) >= 0.52 ||
          primary.duplicateOf === article.id ||
          article.duplicateOf === primary.id)
      );
    });

    if (existing) existing.push(article);
    else clusters.push([article]);
  }

  return clusters;
}

function mergeEntities(cluster: StandardArticle[]) {
  const merged = {
    people: new Set<string>(),
    companies: new Set<string>(),
    countries: new Set<string>(),
    products: new Set<string>(),
    organizations: new Set<string>(),
    events: new Set<string>(),
    industries: new Set<string>()
  };

  cluster.forEach((article) => {
    Object.entries(article.entities).forEach(([key, values]) => {
      values.forEach((value) => merged[key as keyof typeof merged].add(value));
    });
  });

  return {
    people: [...merged.people].slice(0, 8),
    companies: [...merged.companies].slice(0, 8),
    countries: [...merged.countries].slice(0, 8),
    products: [...merged.products].slice(0, 8),
    organizations: [...merged.organizations].slice(0, 8),
    events: [...merged.events].slice(0, 8),
    industries: [...merged.industries].slice(0, 8)
  };
}

function buildClusters(articles: StandardArticle[]): StoryCluster[] {
  const grouped = clusterArticles(articles);

  return grouped.map((cluster, index) => {
    const sorted = [...cluster].sort((a, b) => b.rankingScore - a.rankingScore);
    const primary = sorted[0];
    const sources = [...new Set(cluster.map((article) => article.sourceName))];
    const latestPublishedAt = [...cluster].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0].publishedAt;
    const trendScore = Math.max(...cluster.map((article) => article.trendScore), 0);
    const clusterId = `cluster-${titleSignature(primary.title) || index}`;

    cluster.forEach((article) => {
      article.clusterId = clusterId;
      article.trendScore = Math.max(article.trendScore, trendScore);
    });

    return {
      clusterId,
      mainHeadline: primary.title,
      aiSummary: primary.aiSummary,
      whyItMatters: primary.whyItMatters,
      keyPoints: primary.keyPoints,
      primaryArticle: primary,
      relatedArticles: sorted.slice(1),
      sources,
      sourcesCount: sources.length,
      latestPublishedAt,
      category: primary.category,
      entities: mergeEntities(cluster),
      sentiment: primary.sentiment,
      impactLevel: primary.impactLevel,
      trendScore
    };
  });
}

function buildTopics(articles: StandardArticle[]): TopicSummary[] {
  const topicMap = new Map<string, TopicSummary>();

  for (const article of articles) {
    const names = [
      ...article.tags,
      ...article.entities.people,
      ...article.entities.companies,
      ...article.entities.countries,
      ...article.entities.products,
      ...article.entities.organizations,
      ...article.entities.events,
      ...article.entities.industries
    ].filter(Boolean);

    names.forEach((name) => {
      const existing = topicMap.get(name) || {
        name,
        count: 0,
        categories: [],
        trendScore: 0
      };
      existing.count += 1;
      existing.categories = [...new Set([...existing.categories, article.category])];
      existing.trendScore = Math.max(existing.trendScore, article.trendScore);
      topicMap.set(name, existing);
    });
  }

  return [...topicMap.values()].sort((a, b) => b.trendScore - a.trendScore || b.count - a.count).slice(0, 80);
}

function makeFallbackArticles(): StandardArticle[] {
  return categories.map((category, index) => {
    const title = `${category.label} daily briefing: key moves editors are tracking`;
    const publishedAt = new Date(Date.now() - index * 3600000).toISOString();
    const article: StandardArticle = {
      id: `flash-feed-${category.id}`,
      title,
      normalizedTitle: normalizedTitle(title),
      description:
        "A concise editor-ready briefing slot for the latest syndicated stories, market-moving updates, and reader-friendly explainers when live feeds are unavailable.",
      aiSummary:
        "Flash Feed is tracking source feeds and preparing the latest verified headlines for this category.",
      whyItMatters:
        "The platform remains available with safe fallback cards while external news feeds refresh or recover.",
      keyPoints: [
        "Live sources are refreshing.",
        "Attribution and original-source links remain required.",
        "Flash Feed will replace this card as soon as feeds return."
      ],
      sourceName: "Flash Feed Desk",
      sourceUrl: "https://flashfeed.blog",
      sourceLogo: faviconForUrl("https://flashfeed.blog"),
      originalUrl: "https://flashfeed.blog",
      canonicalUrl: "https://flashfeed.blog",
      imageUrl: variedFallbackImage(category.id, title),
      category: category.id,
      region: "global",
      language: "en",
      publishedAt,
      fetchedAt: new Date().toISOString(),
      author: "",
      tags: [category.label],
      entities: {
        people: [],
        companies: [],
        countries: [],
        products: [],
        organizations: ["Flash Feed"],
        events: [],
        industries: [category.label]
      },
      sentiment: "neutral",
      impactLevel: index < 3 ? "medium" : "low",
      clusterId: `cluster-fallback-${category.id}`,
      duplicateOf: null,
      trendScore: 40 - index,
      rankingScore: 58 - index
    };

    return article;
  });
}

async function enrichArticle(raw: RawArticle, allowLiveAI: boolean): Promise<StandardArticle> {
  const normalized = normalizedTitle(raw.title);
  const id = articleId(raw);
  const cached = getCachedAI(id);
  const enrichment = cached || (allowLiveAI ? await generateAIEnrichment(raw) : fallbackAIEnrichment(raw));
  if (!cached && allowLiveAI) setCachedAI(id, enrichment);

  return {
    ...raw,
    id,
    normalizedTitle: normalized,
    ...enrichment,
    clusterId: "",
    duplicateOf: null,
    trendScore: 0,
    rankingScore: 0
  };
}

function fallbackResult(): NewsPipelineResult {
  const now = new Date().toISOString();
  const articles = makeFallbackArticles();
  const clusters = buildClusters(articles);

  return {
    articles,
    clusters,
    topics: buildTopics(articles),
    sources: sourceConfigs,
    fetchedAt: now
  };
}

export function getInstantNewsPipeline(): NewsPipelineResult {
  return getCachedPipeline() ?? getStalePipeline() ?? fallbackResult();
}

export async function runNewsPipeline(): Promise<NewsPipelineResult> {
  const cached = getCachedPipeline();
  if (cached) return cached;

  try {
    const rawArticles = (await fetchRawArticles())
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
      .slice(0, MAX_PIPELINE_ARTICLES);
    if (rawArticles.length < MIN_LIVE_ITEMS) {
      return getStalePipeline() ?? fallbackResult();
    }

    const enriched = await Promise.all(
      rawArticles.map((article, index) => enrichArticle(article, index < LIVE_AI_ENRICHMENT_LIMIT))
    );
    const withDuplicates = markDuplicates(enriched).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    const clusters = buildClusters(withDuplicates);

    withDuplicates.forEach((article) => {
      const cluster = clusters.find((item) => item.clusterId === article.clusterId);
      const duplicateVolume = withDuplicates.filter((item) => item.duplicateOf === article.id || item.id === article.duplicateOf).length;
      article.trendScore = scoreArticle(article, sourceFor(article), duplicateVolume, cluster?.sourcesCount ?? 1);
      article.rankingScore = Math.round(article.trendScore * 0.7 + (article.duplicateOf ? 0 : 18));
    });

    const rescoredClusters = buildClusters(withDuplicates).sort((a, b) => b.trendScore - a.trendScore);
    const result = {
      articles: withDuplicates.sort((a, b) => b.rankingScore - a.rankingScore),
      clusters: rescoredClusters,
      topics: buildTopics(withDuplicates),
      sources: sourceConfigs,
      fetchedAt: new Date().toISOString()
    };

    setCachedPipeline(result);
    return result;
  } catch (error) {
    console.error("[pipeline] failed", error);
    return getStalePipeline() ?? fallbackResult();
  }
}

export function sortArticles(articles: StandardArticle[], sort?: string) {
  if (sort === "latest") return [...articles].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  if (sort === "trending") return [...articles].sort((a, b) => b.trendScore - a.trendScore);
  return [...articles].sort((a, b) => b.rankingScore - a.rankingScore);
}
