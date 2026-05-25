import type { NewsItem } from "@/lib/news";

type TrendingNowProps = {
  mostRead: NewsItem[];
  fastestGrowing: NewsItem[];
  topics: string[];
};

export function TrendingNow({ mostRead, fastestGrowing, topics }: TrendingNowProps) {
  return (
    <section className="trending-box" aria-label="Trending now">
      <div className="rail-heading">
        <span>Trending Now</span>
        <strong>Live pulse</strong>
      </div>

      <div className="trend-section">
        <h2>Most Read</h2>
        {mostRead.map((item, index) => (
          <a href={item.url} target="_blank" rel="noreferrer" key={item.id}>
            <b>{index + 1}</b>
            <span>{item.title}</span>
          </a>
        ))}
      </div>

      <div className="trend-section">
        <h2>Fastest Growing</h2>
        {fastestGrowing.map((item) => (
          <a href={item.url} target="_blank" rel="noreferrer" key={item.id}>
            <i>{item.category.replace("-", " ")}</i>
            <span>{item.title}</span>
          </a>
        ))}
      </div>

      <div className="topic-cloud">
        <h2>Trending Topics</h2>
        <div>
          {topics.map((topic) => (
            <a href={`#${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={topic}>
              {topic}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
