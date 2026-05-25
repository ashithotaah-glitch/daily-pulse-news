import type { NewsCategory, SourceConfig } from "./types";

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

function googleNewsUrl(query: string) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
}

export const sourceConfigs: SourceConfig[] = [
  ...categories.map((category) => ({
    id: `google-${category.id}`,
    name: "Google News",
    adapter: "google-news-rss" as const,
    homepage: "https://news.google.com",
    url: googleNewsUrl(category.query),
    category: category.id,
    region: "global",
    language: "en",
    credibility: 0.7,
    limit: 4,
    enabled: true
  })),
  {
    id: "reuters-markets",
    name: "Reuters",
    adapter: "google-news-rss",
    homepage: "https://www.reuters.com",
    url: googleNewsUrl("site:reuters.com/business OR site:reuters.com/markets"),
    category: "finance",
    region: "global",
    language: "en",
    credibility: 0.95,
    limit: 8,
    enabled: true
  },
  {
    id: "reuters-world",
    name: "Reuters",
    adapter: "google-news-rss",
    homepage: "https://www.reuters.com",
    url: googleNewsUrl("site:reuters.com/world OR site:reuters.com/technology"),
    category: "world",
    region: "global",
    language: "en",
    credibility: 0.95,
    limit: 8,
    enabled: true
  },
  {
    id: "bbc-top",
    name: "BBC",
    adapter: "generic-rss",
    homepage: "https://www.bbc.com/news",
    url: "https://feeds.bbci.co.uk/news/rss.xml",
    category: "top",
    region: "global",
    language: "en",
    credibility: 0.9,
    limit: 10,
    enabled: true
  },
  {
    id: "bbc-world",
    name: "BBC",
    adapter: "generic-rss",
    homepage: "https://www.bbc.com/news/world",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    category: "world",
    region: "global",
    language: "en",
    credibility: 0.9,
    limit: 8,
    enabled: true
  },
  {
    id: "bbc-business",
    name: "BBC",
    adapter: "generic-rss",
    homepage: "https://www.bbc.com/news/business",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    category: "business",
    region: "global",
    language: "en",
    credibility: 0.9,
    limit: 8,
    enabled: true
  },
  {
    id: "bbc-tech",
    name: "BBC",
    adapter: "generic-rss",
    homepage: "https://www.bbc.com/news/technology",
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    category: "technology",
    region: "global",
    language: "en",
    credibility: 0.9,
    limit: 8,
    enabled: true
  },
  {
    id: "techcrunch",
    name: "TechCrunch",
    adapter: "generic-rss",
    homepage: "https://techcrunch.com",
    url: "https://techcrunch.com/feed/",
    category: "technology",
    region: "global",
    language: "en",
    credibility: 0.82,
    limit: 12,
    enabled: true
  },
  {
    id: "cnbc-top",
    name: "CNBC",
    adapter: "generic-rss",
    homepage: "https://www.cnbc.com",
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    category: "finance",
    region: "global",
    language: "en",
    credibility: 0.84,
    limit: 8,
    enabled: true
  },
  {
    id: "cnbc-finance-bridge",
    name: "CNBC",
    adapter: "google-news-rss",
    homepage: "https://www.cnbc.com",
    url: googleNewsUrl("site:cnbc.com markets business finance"),
    category: "finance",
    region: "global",
    language: "en",
    credibility: 0.84,
    limit: 8,
    enabled: true
  },
  {
    id: "future-api-placeholder",
    name: "Future API",
    adapter: "future-api",
    homepage: "https://flashfeed.blog",
    url: "",
    category: "top",
    region: "global",
    language: "en",
    credibility: 0.5,
    limit: 0,
    enabled: false
  }
];

