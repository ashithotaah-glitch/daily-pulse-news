import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { NewsCard } from "@/components/NewsCard";
import { runNewsPipeline } from "@/lib/news";
import { breadcrumbSchema, sourceSlug } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function articleMatchesTopic(article: Awaited<ReturnType<typeof runNewsPipeline>>["articles"][number], topicName: string, topicSlug: string) {
  const haystack = [
    article.title,
    article.aiSummary,
    article.whyItMatters,
    ...article.tags,
    ...article.entities.people,
    ...article.entities.companies,
    ...article.entities.countries,
    ...article.entities.products,
    ...article.entities.organizations,
    ...article.entities.events,
    ...article.entities.industries
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(topicName.toLowerCase()) || sourceSlug(haystack).includes(topicSlug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topicLabel = slug.replace(/-/g, " ");
  return {
    title: `${topicLabel} News Topic - ${siteConfig.name}`,
    description: `Track ${topicLabel} news with AI summaries, source attribution, and trend signals from Flash Feed.`,
    alternates: {
      canonical: `/topic/${slug}`
    }
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await runNewsPipeline();
  const topic = result.topics.find((item) => sourceSlug(item.name) === slug);
  const topicName = topic?.name || slug.replace(/-/g, " ");
  const articles = result.articles.filter((article) => articleMatchesTopic(article, topicName, slug)).slice(0, 30);
  if (!articles.length && !topic) notFound();

  const clustersById = new Map(result.clusters.map((cluster) => [cluster.clusterId, cluster.sourcesCount]));
  const schema = breadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: "Topics", url: `${siteConfig.url}/topic/${slug}` },
    { name: topicName, url: `${siteConfig.url}/topic/${slug}` }
  ]);

  return (
    <main className="archive-page">
      <Script id={`breadcrumb-topic-${slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="archive-hero">
        <p className="eyebrow">Topic</p>
        <h1>{topicName}</h1>
        <p>
          {topic ? `${topic.count} related stories across ${topic.categories.length} categories.` : "Related Flash Feed coverage from active sources."}
        </p>
      </header>
      <section className="story-grid">
        {articles.map((article) => (
          <NewsCard item={article} key={article.id} relatedSourcesCount={clustersById.get(article.clusterId) || 1} />
        ))}
      </section>
    </main>
  );
}
