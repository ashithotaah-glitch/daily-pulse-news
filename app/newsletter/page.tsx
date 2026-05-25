import type { Metadata } from "next";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { PushNotificationButton } from "@/components/PushNotificationButton";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Subscribe to the Flash Feed daily AI briefing newsletter."
};

export default function NewsletterPage() {
  return (
    <main className="public-page">
      <p className="eyebrow">Newsletter</p>
      <h1>Daily AI briefing, source-linked and fast.</h1>
      <p>Get top stories, category highlights, and what to watch next in a concise morning briefing.</p>
      <NewsletterSignup />
      <PushNotificationButton />
    </main>
  );
}
