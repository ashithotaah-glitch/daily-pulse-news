import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <main className="public-page">
      <p className="eyebrow">Privacy</p>
      <h1>Privacy Policy</h1>
      <p>Flash Feed stores newsletter signups and lightweight analytics events. Reader preferences and saved stories currently live in browser storage unless server-side accounts are added later.</p>
    </main>
  );
}
