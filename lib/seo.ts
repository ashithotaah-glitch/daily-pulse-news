import type { NewsItem, StoryCluster } from "@/lib/news";
import { siteConfig } from "@/lib/site";

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function newsArticleSchema(article: NewsItem, cluster?: StoryCluster) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: cluster?.mainHeadline || article.title,
    description: article.aiSummary || article.description,
    image: article.imageUrl ? [article.imageUrl] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.fetchedAt,
    author: {
      "@type": "Organization",
      name: article.sourceName,
      url: article.sourceUrl
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/favicon.ico`
      }
    },
    mainEntityOfPage: article.originalUrl
  };
}

export function sourceSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
