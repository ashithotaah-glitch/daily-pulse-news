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
  const timeline = [...articles].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 8);
  const topSources = [...new Map(articles.map((article) => [article.sourceName, article])).values()].slice(0, 8);
  const sentimentCounts = articles.reduce(
    (counts, article) => {
      counts[article.sentiment] += 1;
      return counts;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );
  const dominantSentiment = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";
  const briefingPoints = articles.flatMap((article) => article.keyPoints.slice(0, 1)).slice(0, 5);
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
      <section className="topic-intel-grid" aria-label={`${topicName} topic intelligence`}>
        <article className="topic-briefing">
          <span>AI briefing</span>
          <strong>{articles[0]?.aiSummary || `Flash Feed is tracking ${topicName}.`}</strong>
          <p>{articles[0]?.whyItMatters || "More source-linked updates will appear as the feed refreshes."}</p>
        </article>
        <article className="trend-card">
          <span>Trend graph</span>
          <div className="trend-bars" aria-hidden="true">
            {timeline.slice(0, 7).map((article, index) => (
              <i style={{ height: `${Math.max(18, Math.min(100, article.trendScore + index * 4))}%` }} key={article.id} />
            ))}
          </div>
          <small>Placeholder trend graph using current trend scores.</small>
        </article>
        <article className="sentiment-card">
          <span>Sentiment</span>
          <strong>{dominantSentiment}</strong>
          <small>
            Positive {sentimentCounts.positive} / Neutral {sentimentCounts.neutral} / Negative {sentimentCounts.negative}
          </small>
        </article>
        <article className="topic-sources-card">
          <span>Top sources</span>
          <div>
            {topSources.map((article) => (
              <a href={`/source/${sourceSlug(article.sourceName)}`} key={article.sourceName}>
                <img src={article.sourceLogo} alt="" />
                {article.sourceName}
              </a>
            ))}
          </div>
        </article>
      </section>
      <section className="topic-timeline">
        <div className="section-heading">
          <p className="eyebrow">Timeline</p>
          <h2>Latest developments</h2>
        </div>
        <ol>
          {timeline.map((article) => (
            <li key={article.id}>
              <time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleString()}</time>
              <a href={article.originalUrl} target="_blank" rel="noreferrer">
                {article.title}
              </a>
              <span>{article.sourceName}</span>
            </li>
          ))}
        </ol>
      </section>
      {briefingPoints.length ? (
        <section className="topic-key-points">
          {briefingPoints.map((point) => (
            <span key={point}>{point}</span>
          ))}
        </section>
      ) : null}
      <section className="story-grid">
        {articles.map((article) => (
          <NewsCard item={article} key={article.id} relatedSourcesCount={clustersById.get(article.clusterId) || 1} />
        ))}
      </section>
    </main>
  );
}
