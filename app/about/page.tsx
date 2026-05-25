import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main className="public-page">
      <p className="eyebrow">About</p>
      <h1>Flash Feed is a fast news intelligence layer.</h1>
      <p>We aggregate source-linked headlines, normalize metadata, cluster similar stories, and generate concise summaries while sending readers to original publishers.</p>
      <div className="public-grid">
        <article><strong>Source attribution</strong><span>Every story card shows publisher name, logo, timestamp, category, and a direct link to the original source.</span></article>
        <article><strong>AI summaries</strong><span>Flash Feed summarizes only available metadata, descriptions, and source-linked story context. We do not republish full articles.</span></article>
        <article><strong>Topic intelligence</strong><span>Topics include timelines, sentiment, top sources, related stories, and trend context for faster discovery.</span></article>
        <article><strong>Reader tools</strong><span>Readers can follow topics, save stories, receive briefings, and use Ask FlashFeed for grounded news search.</span></article>
      </div>
    </main>
  );
}
