import type { NewsItem } from "@/lib/news";

function relativeTime(value: string) {
  const published = Date.parse(value);
  if (Number.isNaN(published)) return "Just now";

  const diffMinutes = Math.max(1, Math.round((Date.now() - published) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function NewsCard({
  item,
  feature = false,
  relatedSourcesCount = 1
}: {
  item: NewsItem;
  feature?: boolean;
  relatedSourcesCount?: number;
}) {
  return (
    <article className={feature ? "news-card feature" : "news-card"}>
      <a className="image-link" href={item.originalUrl} target="_blank" rel="noreferrer" aria-label={item.title}>
        <span style={{ backgroundImage: `url(${item.imageUrl})` }} />
      </a>
      <div className="news-card-body">
        <div className="story-meta">
          <span className="category-pill">{item.category.replace("-", " ")}</span>
          <span className="source-line">
            <img src={item.sourceLogo} alt="" />
            <span>{item.sourceName}</span>
            <time dateTime={item.publishedAt}>{relativeTime(item.publishedAt)}</time>
          </span>
        </div>
        <h3>
          <a href={item.originalUrl} target="_blank" rel="noreferrer">
            {item.title}
          </a>
        </h3>
        <p>
          <span className="ai-label">AI Summary:</span>
          {item.aiSummary}
        </p>
        <p className="why-it-matters">
          <span>Why it matters:</span>
          {item.whyItMatters}
        </p>
        <footer className="card-intel">
          <span className={`impact ${item.impactLevel}`}>{item.impactLevel} impact</span>
          <span>Trend {item.trendScore}</span>
          <span>{relatedSourcesCount} source{relatedSourcesCount === 1 ? "" : "s"}</span>
        </footer>
        <a className="read-source" href={item.originalUrl} target="_blank" rel="noreferrer">
          Read Source
        </a>
      </div>
    </article>
  );
}
