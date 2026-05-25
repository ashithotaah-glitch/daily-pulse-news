import type { AIEnrichment, ImpactLevel, RawArticle, Sentiment, StandardArticle } from "./types";
import { canonicalUrl, keywordSet, stripTags } from "./utils";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const SKIP_AI_DURING_BUILD = process.env.NEXT_PHASE === "phase-production-build";

const emptyEntities: StandardArticle["entities"] = {
  people: [],
  companies: [],
  countries: [],
  products: [],
  organizations: [],
  events: [],
  industries: []
};

function titleCase(value: string) {
  return value.replace(/\b\w/g, (match) => match.toUpperCase());
}

function simpleTags(article: Pick<RawArticle, "title" | "description" | "category">) {
  const words = [...keywordSet(`${article.title} ${article.description}`)];
  return [article.category, ...words.slice(0, 5)].map((tag) => titleCase(tag.replace("-", " ")));
}

function extractSimpleEntities(value: string): StandardArticle["entities"] {
  const candidates = value.match(/\b[A-Z][A-Za-z0-9&.-]*(?:\s+[A-Z][A-Za-z0-9&.-]*){0,3}/g) ?? [];
  const unique = [...new Set(candidates)].filter((item) => item.length > 2).slice(0, 12);
  const countries = unique.filter((item) =>
    /India|China|US|United States|UK|Russia|Iran|Israel|Singapore|Europe|Japan|Korea|Canada|France|Germany/i.test(item)
  );
  const companies = unique.filter((item) => /Apple|OpenAI|Google|Microsoft|Nvidia|Tesla|Samsung|Meta|Amazon|CNBC|BBC/i.test(item));

  return {
    ...emptyEntities,
    companies,
    countries,
    organizations: unique.filter((item) => !countries.includes(item) && !companies.includes(item)).slice(0, 6)
  };
}

function simpleImpact(article: RawArticle): ImpactLevel {
  const text = `${article.title} ${article.description}`.toLowerCase();
  if (/war|attack|election|inflation|market|rate|ai|security|death|crisis|surge|deal/.test(text)) return "high";
  if (/launch|growth|policy|earnings|government|court|health|climate/.test(text)) return "medium";
  return "low";
}

function simpleSentiment(article: RawArticle): Sentiment {
  const text = `${article.title} ${article.description}`.toLowerCase();
  if (/fall|drop|crisis|war|death|risk|fear|warning|attack|slump/.test(text)) return "negative";
  if (/rise|gain|growth|win|surge|boost|deal|launch/.test(text)) return "positive";
  return "neutral";
}

export function fallbackAIEnrichment(article: RawArticle): AIEnrichment {
  const cleanDescription = stripTags(article.description);
  const summary =
    cleanDescription && cleanDescription.length > 45
      ? cleanDescription.split(/(?<=[.!?])\s+/)[0].slice(0, 220)
      : `This update centers on ${article.title.replace(/[.!?]$/g, "")}.`;

  return {
    aiSummary: summary,
    whyItMatters: `This story may affect readers following ${article.category.replace("-", " ")} because it adds fresh context from ${article.sourceName}.`,
    keyPoints: [
      article.title,
      cleanDescription || "Details are developing from the original source.",
      `Source attribution: ${article.sourceName}`
    ].map((point) => point.slice(0, 140)),
    tags: simpleTags(article),
    entities: extractSimpleEntities(`${article.title} ${article.description}`),
    sentiment: simpleSentiment(article),
    impactLevel: simpleImpact(article)
  };
}

function safeJsonParse(value: string): Partial<AIEnrichment> {
  try {
    return JSON.parse(value);
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  }
}

function normalizeAIEnrichment(parsed: Partial<AIEnrichment>, fallback: AIEnrichment): AIEnrichment {
  return {
    aiSummary: parsed.aiSummary || fallback.aiSummary,
    whyItMatters: parsed.whyItMatters || fallback.whyItMatters,
    keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length ? parsed.keyPoints.slice(0, 3) : fallback.keyPoints,
    tags: Array.isArray(parsed.tags) && parsed.tags.length ? parsed.tags.slice(0, 8) : fallback.tags,
    entities: { ...emptyEntities, ...(parsed.entities || {}) },
    sentiment: ["negative", "neutral", "positive"].includes(parsed.sentiment || "") ? (parsed.sentiment as Sentiment) : fallback.sentiment,
    impactLevel: ["low", "medium", "high"].includes(parsed.impactLevel || "") ? (parsed.impactLevel as ImpactLevel) : fallback.impactLevel
  };
}

function enrichmentPrompt(article: RawArticle) {
  return JSON.stringify({
    instruction:
      "You enrich news metadata for a copyright-safe aggregator. Use only the provided headline, description, metadata, and URL. Do not copy full article body. Return compact JSON only.",
    task: "Create a short summary, why it matters, 3 key points, tags, entities, sentiment, and impact level.",
    schema: {
      aiSummary: "string under 240 chars",
      whyItMatters: "string under 220 chars",
      keyPoints: ["3 concise strings"],
      tags: ["category tags"],
      entities: {
        people: [],
        companies: [],
        countries: [],
        products: [],
        organizations: [],
        events: [],
        industries: []
      },
      sentiment: "negative|neutral|positive",
      impactLevel: "low|medium|high"
    },
    article: {
      title: article.title,
      description: article.description,
      source: article.sourceName,
      category: article.category,
      url: canonicalUrl(article.originalUrl)
    }
  });
}

async function generateGeminiEnrichment(article: RawArticle, fallback: AIEnrichment): Promise<AIEnrichment | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          },
          contents: [
            {
              role: "user",
              parts: [{ text: enrichmentPrompt(article) }]
            }
          ]
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini failed: ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("") ?? "{}";
    return normalizeAIEnrichment(safeJsonParse(text), fallback);
  } catch (error) {
    console.error("[ai] Gemini enrichment failed", error);
    return null;
  }
}

async function generateOpenAIEnrichment(article: RawArticle, fallback: AIEnrichment): Promise<AIEnrichment | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You enrich news metadata for a copyright-safe aggregator. Use only provided headline, description, metadata, and URL. Return compact JSON only."
          },
          {
            role: "user",
            content: enrichmentPrompt(article)
          }
        ]
      })
    });

    if (!response.ok) throw new Error(`OpenAI failed: ${response.status}`);
    const data = await response.json();
    const parsed = safeJsonParse(data.choices?.[0]?.message?.content ?? "{}");

    return normalizeAIEnrichment(parsed, fallback);
  } catch (error) {
    console.error("[ai] OpenAI enrichment failed", error);
    return null;
  }
}

export async function generateAIEnrichment(article: RawArticle): Promise<AIEnrichment> {
  const fallback = fallbackAIEnrichment(article);
  if (SKIP_AI_DURING_BUILD) return fallback;

  const gemini = await generateGeminiEnrichment(article, fallback);
  if (gemini) return gemini;

  const openai = await generateOpenAIEnrichment(article, fallback);
  if (openai) return openai;

  return fallback;
}
