import type { Metadata } from "next";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: "Advertise",
  description: "Reach Flash Feed readers through premium news placements, sponsored cards, newsletters, and direct campaigns."
};

export default function AdvertisePage() {
  return (
    <main className="public-page">
      <p className="eyebrow">Advertise</p>
      <h1>Reach readers while they are actively following the news.</h1>
      <p>Flash Feed supports homepage, feed, sidebar, mobile, sponsored-card, and newsletter sponsorship placements.</p>
      <div className="public-grid">
        {["Homepage takeover", "In-feed native", "Sidebar display", "Newsletter sponsor"].map((item) => (
          <article key={item}><strong>{item}</strong><span>Available through the monetization admin panel.</span></article>
        ))}
      </div>
      <NewsletterSignup compact />
    </main>
  );
}
