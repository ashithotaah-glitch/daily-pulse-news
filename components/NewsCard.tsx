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

export function NewsCard({ item, feature = false }: { item: NewsItem; feature?: boolean }) {
  return (
    <article className={feature ? "news-card feature" : "news-card"}>
      <a className="image-link" href={item.url} target="_blank" rel="noreferrer" aria-label={item.title}>
        <span style={{ backgroundImage: `url(${item.image})` }} />
      </a>
      <div className="news-card-body">
        <div className="story-meta">
          <span className="category-pill">{item.category.replace("-", " ")}</span>
          <span className="source-line">
            <img src={item.sourceIcon} alt="" />
            <span>{item.source}</span>
            <time dateTime={item.publishedAt}>{relativeTime(item.publishedAt)}</time>
          </span>
        </div>
        <h3>
          <a href={item.url} target="_blank" rel="noreferrer">
            {item.title}
          </a>
        </h3>
        <p>
          <span className="ai-label">AI Summary:</span>
          {item.aiSummary}
        </p>
      </div>
    </article>
  );
}
