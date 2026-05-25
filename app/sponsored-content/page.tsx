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
    </main>
  );
}
