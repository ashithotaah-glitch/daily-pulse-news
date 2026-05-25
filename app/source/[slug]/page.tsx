import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { NewsCard } from "@/components/NewsCard";
import { runNewsPipeline, sourceConfigs } from "@/lib/news";
import { readAdminStore } from "@/lib/admin/store";
import { breadcrumbSchema, sourceSlug } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function scoreLabel(score: number) {
  if (score >= 0.9) return "Very high";
  if (score >= 0.75) return "High";
  if (score >= 0.6) return "Moderate";
  return "Developing";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const source = sourceConfigs.find((item) => sourceSlug(item.name) === slug);
  const name = source?.name || slug.replace(/-/g, " ");
  return {
    title: `${name} Source Profile - ${siteConfig.name}`,
    description: `View ${name} source attribution, credibility context, and latest stories surfaced by Flash Feed.`,
    alternates: {
      canonical: `/source/${slug}`
    }
  };
}

export default async function SourcePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await runNewsPipeline();
  const articles = result.articles.filter((article) => sourceSlug(article.sourceName) === slug).slice(0, 30);
  if (!articles.length) notFound();

  const sourceName = articles[0].sourceName;
  const config = sourceConfigs.find((item) => sourceSlug(item.name) === slug);
  const adminStore = await readAdminStore();
  const adminSource = adminStore.sources.find((item) => sourceSlug(item.name) === slug);
  const credibility = adminSource?.credibilityScore ?? config?.credibility ?? 0.7;
  const sourceUrl = config?.homepage || articles[0].sourceUrl || articles[0].originalUrl;
  const clustersById = new Map(result.clusters.map((cluster) => [cluster.clusterId, cluster.sourcesCount]));
  const schema = breadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: "Sources", url: `${siteConfig.url}/source/${slug}` },
    { name: sourceName, url: `${siteConfig.url}/source/${slug}` }
  ]);

  return (
    <main className="archive-page source-profile-page">
      <Script id={`breadcrumb-source-${slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="archive-hero source-profile">
        <div>
          <p className="eyebrow">Source profile</p>
          <h1>{sourceName}</h1>
          <p>Flash Feed links readers to original reporting and uses short summaries only for discovery, attribution, and context.</p>
        </div>
        <dl>
          <div>
            <dt>Credibility</dt>
            <dd>{scoreLabel(credibility)} ({Math.round(credibility * 100)}/100)</dd>
          </div>
          <div>
            <dt>Active stories</dt>
            <dd>{articles.length}</dd>
          </div>
          <div>
            <dt>Primary category</dt>
            <dd>{config?.category || articles[0].category}</dd>
          </div>
        </dl>
        <a className="public-button" href={sourceUrl} target="_blank" rel="noreferrer">
          Visit source
        </a>
      </header>
      <section className="story-grid">
        {articles.map((article) => (
          <NewsCard item={article} key={article.id} relatedSourcesCount={clustersById.get(article.clusterId) || 1} />
        ))}
      </section>
    </main>
  );
}
