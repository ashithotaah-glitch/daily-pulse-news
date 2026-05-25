import type { MetadataRoute } from "next";
import { categories, runNewsPipeline } from "@/lib/news";
import { siteConfig } from "@/lib/site";

function url(path = "") {
  return `${siteConfig.url}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result = await runNewsPipeline();
  const staticPages = ["", "/advertise", "/sponsored-content", "/newsletter", "/about", "/contact", "/privacy-policy", "/terms", "/saved"];
  const categoryPages = categories.map((category) => `/category/${category.id}`);
  const topicPages = result.topics.slice(0, 60).map((topic) => `/topic/${encodeURIComponent(topic.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`);
  const sourcePages = [...new Set(result.articles.map((article) => article.sourceName))]
    .slice(0, 30)
    .map((source) => `/source/${encodeURIComponent(source.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`);
  const storyPages = result.clusters.slice(0, 80).map((cluster) => `/story/${encodeURIComponent(cluster.clusterId)}`);

  return [...staticPages, ...categoryPages, ...topicPages, ...sourcePages, ...storyPages].map((path) => ({
    url: url(path),
    lastModified: result.fetchedAt,
    changeFrequency: path.startsWith("/story") ? "hourly" : "daily",
    priority: path === "" ? 1 : path.startsWith("/story") ? 0.8 : 0.7
  }));
}
