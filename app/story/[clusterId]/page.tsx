import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { NewsCard } from "@/components/NewsCard";
import { runNewsPipeline } from "@/lib/news";
import { breadcrumbSchema, newsArticleSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 600;

type PageProps = {
  params: Promise<{ clusterId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clusterId } = await params;
  const result = await runNewsPipeline();
  const cluster = result.clusters.find((item) => item.clusterId === decodeURIComponent(clusterId));
  const article = cluster?.primaryArticle;
  if (!article) return {};

  return {
    title: `${cluster.mainHeadline} - ${siteConfig.name}`,
    description: cluster.aiSummary,
    alternates: {
      canonical: `/story/${encodeURIComponent(cluster.clusterId)}`
    },
    openGraph: {
      title: cluster.mainHeadline,
      description: cluster.aiSummary,
      url: `${siteConfig.url}/story/${encodeURIComponent(cluster.clusterId)}`,
      images: article.imageUrl ? [article.imageUrl] : undefined,
      type: "article"
    }
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { clusterId } = await params;
  const result = await runNewsPipeline();
  const cluster = result.clusters.find((item) => item.clusterId === decodeURIComponent(clusterId));
  if (!cluster) notFound();

  const article = cluster.primaryArticle;
  const related = cluster.relatedArticles.filter((item) => item.id !== article.id).slice(0, 6);
  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: article.category, url: `${siteConfig.url}/category/${article.category}` },
    { name: cluster.mainHeadline, url: `${siteConfig.url}/story/${encodeURIComponent(cluster.clusterId)}` }
  ]);
  const newsSchema = newsArticleSchema(article, cluster);

  return (
    <main className="story-page">
      <Script id={`story-news-${cluster.clusterId}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }} />
      <Script id={`story-breadcrumb-${cluster.clusterId}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <article className="story-detail">
        <header>
          <p className="eyebrow">{article.category.replace("-", " ")}</p>
          <h1>{cluster.mainHeadline}</h1>
          <div className="story-source-row">
            <img src={article.sourceLogo} alt="" />
            <span>{article.sourceName}</span>
            <time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleString()}</time>
            <strong>{cluster.sourcesCount} source{cluster.sourcesCount === 1 ? "" : "s"}</strong>
          </div>
        </header>
        <a className="story-hero-image" href={article.originalUrl} target="_blank" rel="noreferrer" aria-label="Read original source">
          <span style={{ backgroundImage: `url(${article.imageUrl})` }} />
        </a>
        <section className="story-intel-panel">
          <div>
            <h2>AI summary</h2>
            <p>{cluster.aiSummary}</p>
          </div>
          <div>
            <h2>Why it matters</h2>
            <p>{cluster.whyItMatters}</p>
          </div>
        </section>
        <section className="story-key-points">
          <h2>Key points</h2>
          <ul>
            {cluster.keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
        <div className="story-actions-row">
          <a className="public-button" href={article.originalUrl} target="_blank" rel="noreferrer">
            Read original source
          </a>
          <a className="public-button secondary" href={`/source/${article.sourceName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
            View source profile
          </a>
        </div>
      </article>
      {related.length ? (
        <section className="related-stories">
          <div className="section-heading">
            <p className="eyebrow">Related coverage</p>
            <h2>More on this story</h2>
          </div>
          <div className="story-grid">
            {related.map((item) => (
              <NewsCard item={item} key={item.id} relatedSourcesCount={cluster.sourcesCount} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
