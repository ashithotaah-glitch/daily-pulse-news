import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <main className="public-page">
      <p className="eyebrow">Terms</p>
      <h1>Terms of Use</h1>
      <p>Flash Feed provides source-linked news summaries and metadata for discovery. Original publishers retain ownership of their content.</p>
      <div className="policy-section">
        <h2>Use of the service</h2>
        <p>Flash Feed is provided for news discovery, briefing, search, and source attribution. Readers should visit original publishers for full reporting.</p>
        <h2>Content ownership</h2>
        <p>Headlines, descriptions, images, and linked reporting belong to their respective publishers. Flash Feed displays attribution and links to original source pages.</p>
        <h2>Advertising and sponsorships</h2>
        <p>Sponsored content and ads are labeled. Advertisers are responsible for the accuracy and legality of their claims and destinations.</p>
        <h2>Limitations</h2>
        <p>AI summaries may be imperfect and should not be treated as legal, financial, medical, or investment advice.</p>
      </div>
    </main>
  );
}
