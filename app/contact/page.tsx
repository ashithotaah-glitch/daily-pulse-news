import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main className="public-page">
      <p className="eyebrow">Contact</p>
      <h1>Contact Flash Feed</h1>
      <p>For partnerships, source requests, corrections, sponsorships, privacy requests, and advertising inquiries, contact the Flash Feed team.</p>
      <div className="public-grid">
        <article><strong>Corrections</strong><span>Send source URL, story title, and the correction request.</span></article>
        <article><strong>Advertising</strong><span>Ask about homepage, in-feed, sidebar, newsletter, and sponsored content campaigns.</span></article>
        <article><strong>Sources</strong><span>Recommend credible RSS feeds or publishers for review.</span></article>
        <article><strong>Privacy</strong><span>Request newsletter subscription or analytics data support.</span></article>
      </div>
      <a className="public-button" href="mailto:hello@flashfeed.blog">hello@flashfeed.blog</a>
    </main>
  );
}
