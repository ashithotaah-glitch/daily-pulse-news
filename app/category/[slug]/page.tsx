import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { NewsCard } from "@/components/NewsCard";
import { categories, runNewsPipeline } from "@/lib/news";
import type { NewsCategory } from "@/lib/news";
import { breadcrumbSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function findCategory(slug: string) {
  return categories.find((category) => category.id === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) return {};

  return {
    title: `${category.label} News - ${siteConfig.name}`,
    description: `Latest ${category.label.toLowerCase()} news, AI summaries, source attribution, and trend context from Flash Feed.`,
    alternates: {
      canonical: `/category/${category.id}`
    },
    openGraph: {
      title: `${category.label} News - ${siteConfig.name}`,
      description: `Latest ${category.label.toLowerCase()} stories from trusted sources.`,
      url: `${siteConfig.url}/category/${category.id}`,
      type: "website"
    }
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) notFound();

  const result = await runNewsPipeline();
  const clustersById = new Map(result.clusters.map((cluster) => [cluster.clusterId, cluster.sourcesCount]));
  const articles = result.articles.filter((article) => article.category === (category.id as NewsCategory)).slice(0, 30);
  const schema = breadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: category.label, url: `${siteConfig.url}/category/${category.id}` }
  ]);

  return (
    <main className="archive-page">
      <Script id={`breadcrumb-category-${category.id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="archive-hero">
        <p className="eyebrow">{category.label}</p>
        <h1>{category.label} news</h1>
        <p>AI-enhanced headlines, concise summaries, and original source links for the latest {category.label.toLowerCase()} coverage.</p>
      </header>
      <section className="story-grid">
        {articles.map((article) => (
          <NewsCard item={article} key={article.id} relatedSourcesCount={clustersById.get(article.clusterId) || 1} />
        ))}
      </section>
    </main>
  );
}
