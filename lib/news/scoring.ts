import type { SourceConfig, StandardArticle } from "./types";
import { clampScore } from "./utils";

const categoryWeight: Record<string, number> = {
  top: 14,
  geopolitics: 14,
  finance: 13,
  technology: 12,
  business: 11,
  health: 10,
  science: 8,
  world: 10,
  entertainment: 6,
  sports: 6
};

export function scoreArticle(article: StandardArticle, source?: SourceConfig, duplicateVolume = 0, sourcesCount = 1) {
  const ageHours = Math.max(0, (Date.now() - Date.parse(article.publishedAt)) / 3600000);
  const recency = Math.max(0, 35 - ageHours * 2.4);
  const credibility = (source?.credibility ?? 0.65) * 20;
  const sourceBreadth = Math.min(15, sourcesCount * 4);
  const duplicateScore = Math.min(12, duplicateVolume * 3);
  const category = categoryWeight[article.category] ?? 6;
  const impact = article.impactLevel === "high" ? 12 : article.impactLevel === "medium" ? 7 : 3;
  const engagementPlaceholder = 5;

  return clampScore(recency + credibility + sourceBreadth + duplicateScore + category + impact + engagementPlaceholder);
}
