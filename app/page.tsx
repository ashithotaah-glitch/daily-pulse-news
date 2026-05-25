import { AdSlot } from "@/components/AdSlot";
import { CategoryTabs } from "@/components/CategoryTabs";
import { NewsCard } from "@/components/NewsCard";
import { TrendingNow } from "@/components/TrendingNow";
import { categories, getFeatured, getNews } from "@/lib/news";
import { siteConfig } from "@/lib/site";

export const revalidate = 600;

export default async function Home() {
  const news = await getNews();
  const featured = getFeatured(news);
  const instantUpdates = news.slice(1, 13);
  const latest = news.slice(13, 19);
  const topCluster = news.slice(1, 5);
  const editorsPicks = news.slice(7, 11);
  const mostRead = news.slice(2, 7);
  const fastestGrowing = news.slice(7, 11);
  const trendingTopics = ["OpenAI", "India markets", "Apple AI", "Oil prices", "Cybersecurity", "Streaming"];

  return (
    <main>
      <div className="top-ad-wrap">
        <AdSlot label="Top billboard" size="970 x 250 responsive" />
      </div>

      <section className="publisher-hero" id="top">
        <div className="section-kicker">Live global briefing</div>
        <div className="lead-layout">
          <article className="lead-story">
            <a className="lead-image" href={featured.url} target="_blank" rel="noreferrer">
              <span style={{ backgroundImage: `url(${featured.image})` }} />
            </a>
            <div className="lead-copy">
              <p className="eyebrow">{featured.category.replace("-", " ")}</p>
              <h1>
                <a href={featured.url} target="_blank" rel="noreferrer">
                  {featured.title}
                </a>
              </h1>
              <p>{featured.summary}</p>
              <small>{featured.source}</small>
            </div>
          </article>
          <aside className="top-stories">
            <h2>Top Stories</h2>
            {topCluster.map((item) => (
              <a href={item.url} target="_blank" rel="noreferrer" key={item.id}>
                <span>{item.category.replace("-", " ")}</span>
                <strong>{item.title}</strong>
              </a>
            ))}
          </aside>
        </div>
      </section>

      <CategoryTabs />

      <section className="instant-news" id="latest">
        <div className="section-heading">
          <p className="eyebrow">Latest Updates</p>
          <h2>Happening now</h2>
        </div>
        <div className="story-grid instant-grid">
          {instantUpdates.map((item) => (
            <NewsCard item={item} key={item.id} />
          ))}
        </div>
      </section>

      <section className="market-strip" aria-label="Flash Feed coverage">
        {["Live feed updates", "10 core categories", "Global coverage", "Fast briefings"].map((metric) => (
          <span key={metric}>{metric}</span>
        ))}
      </section>

      <section className="layout-grid">
        <div>
          <div className="section-heading">
            <p className="eyebrow">Latest</p>
            <h2>Fresh from the wire</h2>
          </div>
          <div className="story-grid inline-grid">
            {latest.map((item) => (
              <NewsCard item={item} key={item.id} />
            ))}
          </div>
        </div>
        <aside className="right-rail">
          <TrendingNow mostRead={mostRead} fastestGrowing={fastestGrowing} topics={trendingTopics} />
          <AdSlot label="Article rail" size="300 x 600" compact />
          <div className="briefing-box">
            <span>Newsletter</span>
            <strong>Flash Feed Morning</strong>
            <p>Get the day's essential stories, market context, and culture picks in one quick briefing.</p>
            <a href="#newsletter">Sign up</a>
          </div>
          <section className="editors-box">
            <h2>Editor Picks</h2>
            {editorsPicks.map((item) => (
              <a href={item.url} target="_blank" rel="noreferrer" key={item.id}>
                {item.title}
              </a>
            ))}
          </section>
        </aside>
      </section>

      <section className="mid-page-ad">
        <AdSlot label="In-feed sponsor" size="Fluid responsive" />
      </section>

      {categories.map((category) => {
        const items = news.filter((item) => item.category === category.id).slice(0, 4);
        if (!items.length) return null;

        return (
          <section className="category-section" id={category.id} key={category.id}>
            <div className="section-heading">
              <p className="eyebrow">{category.label}</p>
              <h2>{category.label} updates</h2>
            </div>
            <div className="story-grid compact">
              {items.map((item) => (
                <NewsCard item={item} key={item.id} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="membership-band" id="membership">
        <div>
          <p className="eyebrow">Reader Support</p>
          <h2>Support independent fast briefing journalism.</h2>
          <p>Unlock fewer ads, saved stories, weekly analysis, and premium market briefings.</p>
        </div>
        <a href="#newsletter">Join the briefing list</a>
      </section>

      <section className="newsletter-band" id="newsletter">
        <div>
          <p className="eyebrow">Newsletter</p>
          <h2>Start every morning with Flash Feed.</h2>
        </div>
        <form>
          <input type="email" placeholder="Email address" aria-label="Email address" />
          <button type="button">Sign up</button>
        </form>
      </section>
    </main>
  );
}
