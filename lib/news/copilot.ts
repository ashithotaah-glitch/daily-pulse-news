import { searchNewsData } from "./personalization";
import type { NewsPipelineResult, StandardArticle, StoryCluster } from "./types";

export type CopilotAnswer = {
  answer: string;
  keyDevelopments: string[];
  relatedStories: Pick<StandardArticle, "id" | "title" | "sourceName" | "sourceLogo" | "originalUrl" | "publishedAt" | "category" | "aiSummary" | "whyItMatters" | "trendScore" | "impactLevel" | "clusterId">[];
  citations: { title: string; sourceName: string; originalUrl: string }[];
  clusters: Pick<StoryCluster, "clusterId" | "mainHeadline" | "sources" | "sourcesCount" | "trendScore">[];
  grounded: boolean;
};

const COPILOT_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 3500);
const COPILOT_CACHE_TTL_MS = 20 * 60 * 1000;
const copilotCache = new Map<string, { expiresAt: number; value: CopilotAnswer }>();

function compactArticle(article: StandardArticle) {
  return {
    id: article.id,
    title: article.title,
    sourceName: article.sourceName,
    sourceLogo: article.sourceLogo,
    originalUrl: article.originalUrl,
    publishedAt: article.publishedAt,
    category: article.category,
    aiSummary: article.aiSummary,
    whyItMatters: article.whyItMatters,
    trendScore: article.trendScore,
    impactLevel: article.impactLevel,
    clusterId: article.clusterId
  };
}

function fallbackAnswer(query: string, matches: ReturnType<typeof searchNewsData>): CopilotAnswer {
  const articles = matches.articles.slice(0, 6);
  const lead = articles[0];

  return {
    answer: lead
      ? `Based only on Flash Feed's current aggregated data, the strongest signal is: ${lead.title}. ${lead.aiSummary}`
      : `Flash Feed does not have enough current aggregated data to answer "${query}" reliably yet.`,
    keyDevelopments: articles.flatMap((article) => article.keyPoints.slice(0, 1)).slice(0, 5),
    relatedStories: articles.map(compactArticle),
    citations: articles.map((article) => ({
      title: article.title,
      sourceName: article.sourceName,
      originalUrl: article.originalUrl
    })),
    clusters: matches.clusters.map((cluster) => ({
      clusterId: cluster.clusterId,
      mainHeadline: cluster.mainHeadline,
      sources: cluster.sources,
      sourcesCount: cluster.sourcesCount,
      trendScore: cluster.trendScore
    })),
    grounded: Boolean(articles.length)
  };
}

function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), COPILOT_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function geminiCopilot(query: string, matches: ReturnType<typeof searchNewsData>, fallback: CopilotAnswer) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !matches.articles.length || process.env.NEXT_PHASE === "phase-production-build") return null;

  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationConfig: {
            temperature: 0.15,
            responseMimeType: "application/json"
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: JSON.stringify({
                    instruction:
                      "Answer as FlashFeed's AI news assistant. Use only the supplied aggregated article metadata, summaries, source names, and URLs. If the data is insufficient, say so. Do not invent facts. Return JSON only.",
                    schema: {
                      answer: "short answer under 650 characters",
                      keyDevelopments: ["3-5 concise bullet strings"]
                    },
                    query,
                    articles: matches.articles.slice(0, 8).map((article) => ({
                      title: article.title,
                      sourceName: article.sourceName,
                      category: article.category,
                      aiSummary: article.aiSummary,
                      whyItMatters: article.whyItMatters,
                      keyPoints: article.keyPoints,
                      publishedAt: article.publishedAt,
                      url: article.originalUrl
                    }))
                  })
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini copilot failed: ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("") ?? "{}";
    const parsed = safeJson(text);
    if (!parsed) return null;

    return {
      ...fallback,
      answer: typeof parsed.answer === "string" ? parsed.answer : fallback.answer,
      keyDevelopments: Array.isArray(parsed.keyDevelopments) && parsed.keyDevelopments.length ? parsed.keyDevelopments.slice(0, 5) : fallback.keyDevelopments
    } satisfies CopilotAnswer;
  } catch (error) {
    console.error("[copilot] Gemini failed", error);
    return null;
  }
}

export async function answerCopilotQuery(query: string, result: NewsPipelineResult): Promise<CopilotAnswer> {
  const normalized = query.trim();
  const cacheKey = `${result.fetchedAt}:${normalized.toLowerCase()}`;
  const cached = copilotCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const matches = searchNewsData(normalized, result.articles, result.clusters);
  const fallback = fallbackAnswer(normalized, matches);
  const ai = await geminiCopilot(normalized, matches, fallback);
  const value = ai || fallback;
  copilotCache.set(cacheKey, { expiresAt: Date.now() + COPILOT_CACHE_TTL_MS, value });
  return value;
}
