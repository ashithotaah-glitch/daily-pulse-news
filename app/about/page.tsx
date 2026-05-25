import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main className="public-page">
      <p className="eyebrow">About</p>
      <h1>Flash Feed is a fast news intelligence layer.</h1>
      <p>We aggregate source-linked headlines, normalize metadata, cluster similar stories, and generate concise summaries while sending readers to original publishers.</p>
    </main>
  );
}
