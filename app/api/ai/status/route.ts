import { NextRequest, NextResponse } from "next/server";
import { generateAIEnrichment } from "@/lib/news/ai";
import type { RawArticle } from "@/lib/news/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shouldTest = searchParams.get("test") === "1";
  const liveLimit = Number(process.env.LIVE_AI_ENRICHMENT_LIMIT || 0);

  if (!shouldTest) {
    return NextResponse.json({
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      openAIConfigured: Boolean(process.env.OPENAI_API_KEY),
      liveAIEnrichmentLimit: liveLimit,
      homepageUsesLiveAI: liveLimit > 0,
      note:
        liveLimit > 0
          ? "Live AI enrichment is enabled for the feed."
          : "Live AI enrichment is disabled for normal feed loads to avoid shared-hosting 503s. Use ?test=1 to test the AI provider separately."
    });
  }

  const sample: RawArticle = {
    title: "Flash Feed AI provider health check",
    description: "A short diagnostic request to confirm whether the configured AI provider can return structured news metadata.",
    sourceName: "Flash Feed",
    sourceUrl: "https://flashfeed.blog",
    sourceLogo: "https://www.google.com/s2/favicons?domain=flashfeed.blog&sz=64",
    originalUrl: "https://flashfeed.blog",
    canonicalUrl: "https://flashfeed.blog",
    imageUrl: "",
    category: "technology",
    region: "global",
    language: "en",
    publishedAt: new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    author: ""
  };

  const startedAt = Date.now();
  const enrichment = await generateAIEnrichment(sample);
  const usedFallback = enrichment.keyPoints.some((point) => point.includes("Source attribution"));

  return NextResponse.json({
    ok: !usedFallback,
    provider: process.env.GEMINI_API_KEY ? "gemini" : process.env.OPENAI_API_KEY ? "openai" : "fallback",
    elapsedMs: Date.now() - startedAt,
    usedFallback,
    enrichment
  });
}
