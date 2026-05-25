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

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  aiSummary: string;
  source: string;
  url: string;
  category: NewsCategory;
  publishedAt: string;
  image: string;
  sourceIcon: string;
};

type FeedSource = {
  name: string;
  homepage: string;
  url: string;
  category: NewsCategory;
  image?: string;
  limit?: number;
};

export const categories: { id: NewsCategory; label: string; query: string }[] = [
  { id: "top", label: "Top Stories", query: "top stories" },
  { id: "technology", label: "Tech", query: "technology AI startups cybersecurity" },
  { id: "business", label: "Business", query: "business economy markets" },
  { id: "finance", label: "Finance", query: "finance investing stocks crypto" },
  { id: "geopolitics", label: "Geo-Politics", query: "geopolitics diplomacy defense" },
  { id: "entertainment", label: "Entertainment", query: "entertainment movies streaming music" },
  { id: "sports", label: "Sports", query: "sports latest" },
  { id: "science", label: "Science", query: "science climate space research" },
  { id: "health", label: "Health", query: "health medicine wellness" },
  { id: "world", label: "World", query: "world news" }
];

const categoryImages: Record<NewsCategory, string> = {
  top: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  business: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  finance: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  geopolitics: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
  entertainment: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
  science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
  health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
  world: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
};

const feedSources: FeedSource[] = [
  {
    name: "Reuters",
    homepage: "https://www.reuters.com",
    url: "https://news.google.com/rss/search?q=site%3Areuters.com%2Fbusiness%20OR%20site%3Areuters.com%2Fmarkets&hl=en-US&gl=US&ceid=US:en",
    category: "finance",
    limit: 8
  },
  {
    name: "Reuters",
    homepage: "https://www.reuters.com",
    url: "https://news.google.com/rss/search?q=site%3Areuters.com%2Fworld%20OR%20site%3Areuters.com%2Ftechnology&hl=en-US&gl=US&ceid=US:en",
    category: "world",
    limit: 8
  },
  {
    name: "BBC",
    homepage: "https://www.bbc.com/news",
    url: "https://feeds.bbci.co.uk/news/rss.xml",
    category: "top",
    limit: 10
  },
  {
    name: "BBC",
    homepage: "https://www.bbc.com/news/world",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    category: "world",
    limit: 8
  },
  {
    name: "BBC",
    homepage: "https://www.bbc.com/news/business",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    category: "business",
    limit: 8
  },
  {
    name: "BBC",
    homepage: "https://www.bbc.com/news/technology",
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    category: "technology",
    limit: 8
  },
  {
    name: "TechCrunch",
    homepage: "https://techcrunch.com",
    url: "https://techcrunch.com/feed/",
    category: "technology",
    limit: 12
  },
  {
    name: "CNBC",
    homepage: "https://www.cnbc.com",
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    category: "finance",
    limit: 10
  },
  {
    name: "CNBC",
    homepage: "https://www.cnbc.com",
    url: "https://news.google.com/rss/search?q=site%3Acnbc.com%20markets%20business%20finance&hl=en-US&gl=US&ceid=US:en",
    category: "finance",
    limit: 8
  },
  {
    name: "CNBC",
    homepage: "https://www.cnbc.com/technology",
    url: "https://www.cnbc.com/id/19854910/device/rss/rss.html",
    category: "technology",
    limit: 8
  },
  {
    name: "CNBC",
    homepage: "https://www.cnbc.com/technology",
    url: "https://news.google.com/rss/search?q=site%3Acnbc.com%2Ftechnology%20OR%20site%3Acnbc.com%2Fai-artificial-intelligence&hl=en-US&gl=US&ceid=US:en",
    category: "technology",
    limit: 8
  },
  {
    name: "CNBC",
    homepage: "https://www.cnbc.com/world",
    url: "https://www.cnbc.com/id/100727362/device/rss/rss.html",
    category: "world",
    limit: 8
  }
];

const fallbackNews: NewsItem[] = categories.flatMap((category, index) => {
  const title = `${category.label} daily briefing: key moves editors are tracking`;
  const summary =
    "A concise editor-ready briefing slot for the latest syndicated stories, market-moving updates, and reader-friendly explainers when live feeds are unavailable.";

  return [
    {
      id: `${category.id}-briefing`,
      title,
      summary,
      aiSummary:
        "Flash Feed is tracking the main developments, source context, and reader impact for this category as live RSS feeds refresh.",
      source: "Flash Feed Desk",
      url: "#",
      category: category.id,
      publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
      image: categoryImages[category.id],
      sourceIcon: faviconForUrl("https://flashfeed.blog")
    }
  ];
});

function decodeHtml(value: string) {
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

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function escapedTag(tag: string) {
  return tag.replace(":", "\\:");
}

function tagValue(item: string, tag: string) {
  const match = item.match(new RegExp(`<${escapedTag(tag)}[^>]*>([\\s\\S]*?)<\\/${escapedTag(tag)}>`, "i"));
  return match ? decodeHtml(match[1]).trim() : "";
}

function attrValue(item: string, tag: string, attr: string) {
  const match = item.match(new RegExp(`<${escapedTag(tag)}[^>]*\\s${attr}=["']([^"']+)["'][^>]*>`, "i"));
  return match ? decodeHtml(match[1]).trim() : "";
}

function canonicalUrl(url: string) {
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

function faviconForUrl(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return "https://www.google.com/s2/favicons?domain=flashfeed.blog&sz=64";
  }
}

function titleSignature(title: string) {
  return title
    .toLowerCase()
    .replace(/[-–—|].*$/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 12)
    .join("-");
}

function cleanTitle(title: string, source: string) {
  return stripTags(title)
    .replace(new RegExp(`\\s[-–—|]\\s${source}\\s*$`, "i"), "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAiSummary(title: string, summary: string, source: string) {
  const cleanSummary = stripTags(summary)
    .replace(/\s+/g, " ")
    .replace(new RegExp(`\\s+${source}\\s*$`, "i"), "")
    .trim();

  const base = cleanSummary && cleanSummary.length > 45 ? cleanSummary : title;
  const sentence = base.split(/(?<=[.!?])\s+/)[0] || base;
  const trimmed = sentence.length > 190 ? `${sentence.slice(0, 187).trim()}...` : sentence;

  if (trimmed.toLowerCase() === title.toLowerCase()) {
    return `This update centers on ${title.replace(/[.!?]$/g, "")}, with Flash Feed tracking the key context and reader impact.`;
  }

  return trimmed;
}

function itemImage(block: string, source: FeedSource) {
  const mediaContent = attrValue(block, "media:content", "url");
  const mediaThumbnail = attrValue(block, "media:thumbnail", "url");
  const enclosure = attrValue(block, "enclosure", "url");
  return mediaContent || mediaThumbnail || enclosure || source.image || categoryImages[source.category];
}

async function fetchSourceFeed(source: FeedSource): Promise<NewsItem[]> {
  const response = await fetch(source.url, {
    headers: {
      "User-Agent": "FlashFeedBot/1.0 (+https://flashfeed.blog)"
    },
    next: { revalidate: 900 }
  });

  if (!response.ok) {
    throw new Error(`Feed failed for ${source.name}`);
  }

  const xml = await response.text();
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  const entryBlocks = itemBlocks.length ? itemBlocks : xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];

  return entryBlocks.slice(0, source.limit ?? 8).map((block, index) => {
    const rawUrl = canonicalUrl(tagValue(block, "link") || attrValue(block, "link", "href") || source.homepage);
    const title = cleanTitle(tagValue(block, "title"), source.name);
    const description = stripTags(
      tagValue(block, "description") || tagValue(block, "summary") || tagValue(block, "content:encoded")
    );
    const publishedAt = new Date(
      tagValue(block, "pubDate") || tagValue(block, "updated") || tagValue(block, "published") || Date.now()
    ).toISOString();
    const aiSummary = buildAiSummary(title, description, source.name);

    return {
      id: `${source.name.toLowerCase()}-${source.category}-${publishedAt}-${index}`,
      title,
      summary: description || aiSummary,
      aiSummary,
      source: source.name,
      url: rawUrl,
      category: source.category,
      publishedAt,
      image: itemImage(block, source),
      sourceIcon: faviconForUrl(source.homepage)
    };
  });
}

function dedupeNews(items: NewsItem[]) {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const deduped: NewsItem[] = [];

  for (const item of items) {
    const urlKey = canonicalUrl(item.url);
    const titleKey = titleSignature(item.title);

    if (!item.title || seenUrls.has(urlKey) || seenTitles.has(titleKey)) continue;

    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    deduped.push(item);
  }

  return deduped;
}

export async function getNews() {
  try {
    const settled = await Promise.allSettled(feedSources.map(fetchSourceFeed));
    const liveItems = settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
    const normalized = dedupeNews(liveItems).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

    if (normalized.length < 8) return fallbackNews;

    return normalized;
  } catch {
    return fallbackNews;
  }
}

export function getFeatured(items: NewsItem[]) {
  return items[0] ?? fallbackNews[0];
}

export function getCategoryImage(category: NewsCategory) {
  return categoryImages[category];
}
