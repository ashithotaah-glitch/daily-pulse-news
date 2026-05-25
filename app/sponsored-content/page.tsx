import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsored Content",
  description: "Sponsored content guidelines and partnership options for Flash Feed."
};

export default function SponsoredContentPage() {
  return (
    <main className="public-page">
      <p className="eyebrow">Sponsored Content</p>
      <h1>Clearly labeled campaigns for news-aware audiences.</h1>
      <p>Sponsored stories on Flash Feed are always labeled, separated from editorial source attribution, and tracked for impressions and clicks.</p>
      <div className="public-grid">
        <article><strong>Clear labels</strong><span>Sponsored placements display “Sponsored” and sponsor names where applicable.</span></article>
        <article><strong>Native cards</strong><span>Campaigns can appear as sponsored cards without hiding original news attribution.</span></article>
        <article><strong>Newsletter sponsor</strong><span>Brands can sponsor the daily briefing newsletter once campaigns are active.</span></article>
        <article><strong>Compliance first</strong><span>Sponsored campaigns must avoid deceptive claims, unsafe content, and misleading redirects.</span></article>
      </div>
    </main>
  );
}
