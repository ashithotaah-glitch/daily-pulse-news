import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main className="public-page">
      <p className="eyebrow">Contact</p>
      <h1>Contact Flash Feed</h1>
      <p>For partnerships, source requests, corrections, and sponsorships, contact the Flash Feed team.</p>
      <a className="public-button" href="mailto:hello@flashfeed.blog">hello@flashfeed.blog</a>
    </main>
  );
}
