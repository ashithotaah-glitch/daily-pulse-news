"use client";

import { useState } from "react";

export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Subscribing...");
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: compact ? "compact" : "newsletter_page" })
    });
    setStatus(response.ok ? "You are on the briefing list." : "Please enter a valid email.");
    if (response.ok) setEmail("");
  }

  return (
    <form className={compact ? "newsletter-form compact" : "newsletter-form"} onSubmit={subscribe}>
      <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email address" aria-label="Email address" />
      <button type="submit">Subscribe</button>
      {status ? <small>{status}</small> : null}
    </form>
  );
}
