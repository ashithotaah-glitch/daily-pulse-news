import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <main className="public-page">
      <p className="eyebrow">Terms</p>
      <h1>Terms of Use</h1>
      <p>Flash Feed provides source-linked news summaries and metadata for discovery. Original publishers retain ownership of their content.</p>
    </main>
  );
}
