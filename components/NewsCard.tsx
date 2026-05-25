import type { NewsItem } from "@/lib/news";

const fitLabels: Record<NewsItem["monetizationFit"], string> = {
  affiliate: "Affiliate fit",
  premium: "Premium fit",
  "display-ads": "Display ad fit"
};

export function NewsCard({ item, feature = false }: { item: NewsItem; feature?: boolean }) {
  return (
    <article className={feature ? "news-card feature" : "news-card"}>
      <a className="image-link" href={item.url} target="_blank" rel="noreferrer" aria-label={item.title}>
        <span style={{ backgroundImage: `url(${item.image})` }} />
      </a>
      <div className="news-card-body">
        <div className="story-meta">
          <span>{item.category.replace("-", " ")}</span>
          <time dateTime={item.publishedAt}>
            {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric" }).format(
              new Date(item.publishedAt)
            )}
          </time>
        </div>
        <h3>
          <a href={item.url} target="_blank" rel="noreferrer">
            {item.title}
          </a>
        </h3>
        <p>{item.summary}</p>
        <footer>
          <span>{item.source}</span>
          <small>{fitLabels[item.monetizationFit]}</small>
        </footer>
      </div>
    </article>
  );
}
