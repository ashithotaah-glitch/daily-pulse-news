import type { AIEnrichment, NewsPipelineResult } from "./types";

type TimedValue<T> = {
  value: T;
  expiresAt: number;
};

const pipelineCache: { current: TimedValue<NewsPipelineResult> | null } = { current: null };
const aiCache = new Map<string, TimedValue<AIEnrichment>>();

export const PIPELINE_CACHE_TTL_MS = 10 * 60 * 1000;
export const AI_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function getCachedPipeline() {
  if (pipelineCache.current && Date.now() < pipelineCache.current.expiresAt) {
    return pipelineCache.current.value;
  }
  return null;
}

export function setCachedPipeline(value: NewsPipelineResult) {
  pipelineCache.current = {
    value,
    expiresAt: Date.now() + PIPELINE_CACHE_TTL_MS
  };
}

export function getStalePipeline() {
  return pipelineCache.current?.value ?? null;
}

export function getCachedAI(key: string) {
  const cached = aiCache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.value;
  return null;
}

export function setCachedAI(key: string, value: AIEnrichment) {
  aiCache.set(key, {
    value,
    expiresAt: Date.now() + AI_CACHE_TTL_MS
  });
}

