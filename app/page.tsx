import { Fragment } from "react";
import { AdSlot } from "@/components/AdSlot";
import { CategoryTabs } from "@/components/CategoryTabs";
import { NewsCard } from "@/components/NewsCard";
import { categories, getFeatured, getNews } from "@/lib/news";
import { siteConfig } from "@/lib/site";

export const revalidate = 1800;

export default async function Home() {
  const news = await getNews();
  const featured = getFeatured(news);
  const latest = news.slice(1, 7);

  return (
    <main>
      <section className="hero" id="top">
        <div className="hero-media" style={{ backgroundImage: `url(${featured.image})` }} />
        <div className="hero-content">
          <p className="eyebrow">Automated Daily Briefing</p>
          <h1>{siteConfig.name}</h1>
          <p>{siteConfig.tagline}</p>
          <div className="hero-actions">
            <a href="#latest">Read latest</a>
          </div>
        </div>
      </section>

      <CategoryTabs />

      <section className="market-strip" aria-label="Publisher metrics">
        {["Hourly feed refresh", "10 core categories", "Global coverage", "Fast briefings"].map((metric) => (
          <span key={metric}>{metric}</span>
        ))}
      </section>

      <section className="layout-grid" id="latest">
        <div>
          <div className="section-heading">
            <p className="eyebrow">Lead Story</p>
            <h2>Latest stories captured from live feeds</h2>
          </div>
          <NewsCard item={featured} feature />
        </div>
        <aside className="right-rail">
          <AdSlot label="Homepage leaderboard" size="970 x 250 responsive" tone="dark" />
          <div className="briefing-box">
            <span>Newsletter</span>
            <strong>FlashFeed Morning</strong>
            <p>Package top stories, market context, and sponsored placements into a daily send.</p>
            <button>Enable signup</button>
          </div>
        </aside>
      </section>

      <section className="story-grid">
        {latest.map((item, index) => (
          <Fragment key={item.id}>
            <NewsCard item={item} key={item.id} />
            {index === 2 ? <AdSlot key="native-ad" label="In-feed native ad" size="Fluid responsive" /> : null}
          </Fragment>
        ))}
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

    </main>
  );
}
