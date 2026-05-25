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
  source: string;
  url: string;
  category: NewsCategory;
  publishedAt: string;
  image: string;
  monetizationFit: "premium" | "affiliate" | "display-ads";
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

const fallbackNews: NewsItem[] = categories.flatMap((category, index) => [
  {
    id: `${category.id}-briefing`,
    title: `${category.label} daily briefing: key moves editors are tracking`,
    summary:
      "A concise editor-ready briefing slot for the latest syndicated stories, market-moving updates, and reader-friendly explainers when live feeds are unavailable.",
    source: "Daily Pulse Desk",
    url: "#",
    category: category.id,
    publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
    image: categoryImages[category.id],
    monetizationFit: index % 3 === 0 ? "premium" : index % 3 === 1 ? "affiliate" : "display-ads"
  }
]);

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function tagValue(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeHtml(match[1]).trim() : "";
}

function sourceFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Syndicated Source";
  }
}

function monetizationFor(category: NewsCategory): NewsItem["monetizationFit"] {
  if (category === "finance" || category === "technology" || category === "business") return "affiliate";
  if (category === "geopolitics" || category === "world") return "premium";
  return "display-ads";
}

async function fetchCategoryFeed(category: (typeof categories)[number]): Promise<NewsItem[]> {
  const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(category.query)}&hl=en-US&gl=US&ceid=US:en`;
  const response = await fetch(feedUrl, { next: { revalidate: 3600 } });

  if (!response.ok) {
    throw new Error(`Feed failed for ${category.id}`);
  }

  const xml = await response.text();
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

  return itemBlocks.slice(0, 8).map((block, index) => {
    const rawUrl = tagValue(block, "link");
    const title = stripTags(tagValue(block, "title"));
    const description = stripTags(tagValue(block, "description"));
    const publishedAt = new Date(tagValue(block, "pubDate") || Date.now()).toISOString();

    return {
      id: `${category.id}-${publishedAt}-${index}`,
      title,
      summary: description || "Read the full syndicated update and related coverage.",
      source: sourceFromUrl(rawUrl),
      url: rawUrl,
      category: category.id,
      publishedAt,
      image: categoryImages[category.id],
      monetizationFit: monetizationFor(category.id)
    };
  });
}

export async function getNews() {
  try {
    const settled = await Promise.allSettled(categories.map(fetchCategoryFeed));
    const liveItems = settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));

    if (liveItems.length < 8) return fallbackNews;

    return liveItems.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
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
