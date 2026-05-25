import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <main className="public-page">
      <p className="eyebrow">Privacy</p>
      <h1>Privacy Policy</h1>
      <p>Flash Feed stores newsletter signups and lightweight analytics events. Reader preferences and saved stories currently live in browser storage unless server-side accounts are added later.</p>
      <div className="policy-section">
        <h2>Information we collect</h2>
        <p>We may collect newsletter email addresses, anonymous analytics events, ad impressions, ad clicks, search queries, and browser-stored preferences such as followed topics and saved stories.</p>
        <h2>How we use information</h2>
        <p>We use this information to deliver newsletters, improve news ranking, measure site performance, prevent abuse, and support advertising operations.</p>
        <h2>Advertising</h2>
        <p>Flash Feed may use Google AdSense and direct sponsorships. Advertising partners may use cookies or similar technologies according to their own policies.</p>
        <h2>Contact</h2>
        <p>For privacy questions, contact hello@flashfeed.blog.</p>
      </div>
    </main>
  );
}
