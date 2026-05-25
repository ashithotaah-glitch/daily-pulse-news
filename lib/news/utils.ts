import { categoryImagePools } from "./images";
import type { NewsCategory } from "./types";

export function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

export function escapedTag(tag: string) {
  return tag.replace(":", "\\:");
}

export function tagValue(item: string, tag: string) {
  const match = item.match(new RegExp(`<${escapedTag(tag)}[^>]*>([\\s\\S]*?)<\\/${escapedTag(tag)}>`, "i"));
  return match ? decodeHtml(match[1]).trim() : "";
}

export function attrValue(item: string, tag: string, attr: string) {
  const match = item.match(new RegExp(`<${escapedTag(tag)}[^>]*\\s${attr}=["']([^"']+)["'][^>]*>`, "i"));
  return match ? decodeHtml(match[1]).trim() : "";
}

export function canonicalUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "guccounter"].forEach((param) =>
      parsed.searchParams.delete(param)
    );
    return parsed.toString();
  } catch {
    return url;
  }
}

export function faviconForUrl(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return "https://www.google.com/s2/favicons?domain=flashfeed.blog&sz=64";
  }
}

export function stableIndex(value: string, modulo: number) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return modulo > 0 ? hash % modulo : 0;
}

export function normalizedTitle(title: string) {
  return stripTags(title)
    .toLowerCase()
    .replace(/[-–—|].*$/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleSignature(title: string) {
  return normalizedTitle(title).split(/\s+/).filter(Boolean).slice(0, 12).join("-");
}

export function keywordSet(value: string) {
  const stopwords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "as",
    "at",
    "by",
    "what",
    "why",
    "how",
    "when",
    "today",
    "this",
    "week",
    "summarize",
    "happened"
  ]);
  const shortSignals = new Set(["ai", "us", "uk", "eu"]);
  return new Set(
    normalizedTitle(value)
      .split(/\s+/)
      .filter((word) => (word.length > 2 || shortSignals.has(word)) && !stopwords.has(word))
  );
}

export function keywordOverlap(a: string, b: string) {
  const left = keywordSet(a);
  const right = keywordSet(b);
  if (!left.size || !right.size) return 0;
  let shared = 0;
  left.forEach((word) => {
    if (right.has(word)) shared += 1;
  });
  return shared / Math.min(left.size, right.size);
}

export function variedFallbackImage(category: NewsCategory, seed: string) {
  const pool = categoryImagePools[category];
  const baseImage = pool[stableIndex(seed, pool.length)];
  const variant = stableIndex(`${category}-${seed}`, 1000);
  const separator = baseImage.includes("?") ? "&" : "?";
  return `${baseImage}${separator}crop=entropy&cs=tinysrgb&sig=${variant}`;
}

export function extractDescriptionImage(block: string) {
  const description = tagValue(block, "description") || tagValue(block, "content:encoded");
  const imgSrc = description.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  return imgSrc ? decodeHtml(imgSrc) : "";
}

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
