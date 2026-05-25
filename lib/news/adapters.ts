import { categoryImages } from "./images";
import type { RawArticle, SourceConfig } from "./types";
import {
  attrValue,
  canonicalUrl,
  decodeHtml,
  extractDescriptionImage,
  faviconForUrl,
  stripTags,
  tagValue,
  variedFallbackImage
} from "./utils";

export interface SourceAdapter {
  fetch(source: SourceConfig): Promise<RawArticle[]>;
}

const FEED_TIMEOUT_MS = 3500;

async function fetchFeedXml(source: SourceConfig) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);

  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "FlashFeedBot/1.0 (+https://flashfeed.blog)"
      },
      next: { revalidate: 600 },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`${source.name} feed failed with ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeRssItem(block: string, source: SourceConfig, index: number): RawArticle {
  // Copyright-safe aggregation: keep only headline, metadata, short feed description,
  // publisher attribution, and the original source URL. Never ingest or reproduce full article bodies.
  const title = stripTags(tagValue(block, "title"));
  const description = stripTags(
    tagValue(block, "description") || tagValue(block, "summary") || tagValue(block, "content:encoded")
  );
  const originalUrl = canonicalUrl(tagValue(block, "link") || attrValue(block, "link", "href") || source.homepage);
  const author = stripTags(tagValue(block, "dc:creator") || tagValue(block, "author"));
  const mediaContent = attrValue(block, "media:content", "url");
  const mediaThumbnail = attrValue(block, "media:thumbnail", "url");
  const enclosure = attrValue(block, "enclosure", "url");
  const descriptionImage = extractDescriptionImage(block);

  return {
    title,
    description,
    sourceName: source.name,
    sourceUrl: source.homepage,
    sourceLogo: faviconForUrl(source.homepage),
    originalUrl,
    canonicalUrl: originalUrl,
    imageUrl:
      mediaContent ||
      mediaThumbnail ||
      enclosure ||
      descriptionImage ||
      source.image ||
      variedFallbackImage(source.category, `${source.id}-${title}-${index}`) ||
      categoryImages[source.category],
    category: source.category,
    region: source.region || "global",
    language: source.language || "en",
    publishedAt: new Date(
      tagValue(block, "pubDate") || tagValue(block, "updated") || tagValue(block, "published") || Date.now()
    ).toISOString(),
    fetchedAt: new Date().toISOString(),
    author
  };
}

class RssBaseAdapter implements SourceAdapter {
  async fetch(source: SourceConfig): Promise<RawArticle[]> {
    const xml = await fetchFeedXml(source);
    const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
    const entryBlocks = itemBlocks.length ? itemBlocks : xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];

    return entryBlocks.slice(0, source.limit ?? 8).map((block, index) => normalizeRssItem(block, source, index));
  }
}

export class GoogleNewsRSSAdapter extends RssBaseAdapter {}
export class GenericRSSAdapter extends RssBaseAdapter {}

export class FutureAPIAdapter implements SourceAdapter {
  async fetch(): Promise<RawArticle[]> {
    return [];
  }
}

export function getAdapter(source: SourceConfig): SourceAdapter {
  if (source.adapter === "google-news-rss") return new GoogleNewsRSSAdapter();
  if (source.adapter === "future-api") return new FutureAPIAdapter();
  return new GenericRSSAdapter();
}

export function cleanGoogleNewsTitle(title: string, sourceName: string) {
  return decodeHtml(title)
    .replace(new RegExp(`\\s[-–—|]\\s${sourceName}\\s*$`, "i"), "")
    .replace(/\s+/g, " ")
    .trim();
}
