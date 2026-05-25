"use client";

import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/lib/site";

type DashboardStat = {
  label: string;
  value: string;
  note: string;
};

type CategoryStat = {
  name: string;
  count: number;
};

type TrendStat = {
  title: string;
  source: string;
  trendScore: number;
};

export type AdminDashboardStats = {
  totalArticles: number;
  activeSources: number;
  failedSources: number;
  failedSourceNames: string[];
  aiSummariesGenerated: number;
  totalUsers: number;
  savedArticles: number;
  topCategories: CategoryStat[];
  trendingStories: TrendStat[];
  adRevenuePlaceholder: string;
};

const revenueSlots = [
  { name: "Top leaderboard", format: "970x250 / responsive", placement: "Homepage header", yield: "High" },
  { name: "In-feed native", format: "Fluid", placement: "Between story cards", yield: "Medium" },
  { name: "Article rail", format: "300x600", placement: "Desktop right rail", yield: "High" },
  { name: "Sponsored briefing", format: "Newsletter + homepage", placement: "Morning package", yield: "Premium" }
];

type Settings = {
  siteTitle: string;
  metaDescription: string;
  adsenseClient: string;
  headerScript: string;
  affiliateDisclosure: string;
  sponsoredRate: string;
  newsletterCta: string;
  paywallEnabled: boolean;
  programmaticAds: boolean;
};

const initialSettings: Settings = {
  siteTitle: siteConfig.name,
  metaDescription: siteConfig.description,
  adsenseClient: siteConfig.adsenseClientId,
  headerScript: "",
  affiliateDisclosure: "This platform may earn commissions from eligible partner links.",
  sponsoredRate: "$2,500",
  newsletterCta: "Get the morning briefing",
  paywallEnabled: true,
  programmaticAds: true
};

export function AdminConsole({ dashboard }: { dashboard: AdminDashboardStats }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);
  const [localSavedCount, setLocalSavedCount] = useState(0);

  const seoScore = useMemo(() => {
    let score = 40;
    if (settings.siteTitle.length >= 10 && settings.siteTitle.length <= 60) score += 20;
    if (settings.metaDescription.length >= 120 && settings.metaDescription.length <= 170) score += 25;
    if (settings.adsenseClient.startsWith("ca-pub-")) score += 15;
    return Math.min(score, 100);
  }, [settings]);

  const dashboardStats: DashboardStat[] = [
    { label: "Total articles fetched", value: dashboard.totalArticles.toLocaleString(), note: "Current normalized feed" },
    { label: "Active sources", value: dashboard.activeSources.toLocaleString(), note: "Enabled source adapters" },
    { label: "Failed sources", value: dashboard.failedSources.toLocaleString(), note: dashboard.failedSourceNames.join(", ") || "No failures detected" },
    { label: "AI summaries generated", value: dashboard.aiSummariesGenerated.toLocaleString(), note: "Includes cached/fallback summaries" },
    { label: "Total users", value: dashboard.totalUsers.toLocaleString(), note: "Database required for real user count" },
    { label: "Saved articles", value: Math.max(dashboard.savedArticles, localSavedCount).toLocaleString(), note: "This-device count until auth/database" },
    { label: "Ad revenue", value: dashboard.adRevenuePlaceholder, note: "Connect AdSense reports later" }
  ];

  useEffect(() => {
    try {
      const savedStories = JSON.parse(window.localStorage.getItem("flashfeed.savedStories.v1") || "[]");
      setLocalSavedCount(Array.isArray(savedStories) ? savedStories.length : 0);
    } catch {
      setLocalSavedCount(0);
    }
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    window.localStorage.setItem("daily-pulse-admin-settings", JSON.stringify(settings));
    setSaved(true);
  }

  return (
    <div className="admin-console">
      <section className="admin-hero">
        <div>
          <p className="eyebrow">Publisher Control Room</p>
          <h1>Manage SEO, ad inventory, sponsored packages, and growth tools.</h1>
        </div>
        <div className="score-card">
          <span>SEO readiness</span>
          <strong>{seoScore}%</strong>
        </div>
      </section>

      <section className="admin-panel dashboard-panel">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2>Platform overview</h2>
          </div>
          <span>Live pipeline snapshot</span>
        </div>

        <div className="dashboard-stat-grid">
          {dashboardStats.map((stat) => (
            <article key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.note}</small>
            </article>
          ))}
        </div>

        <div className="dashboard-insights">
          <section>
            <h3>Top categories</h3>
            {dashboard.topCategories.map((category) => (
              <div className="category-meter" key={category.name}>
                <span>{category.name}</span>
                <strong>{category.count}</strong>
              </div>
            ))}
          </section>

          <section>
            <h3>Trending stories</h3>
            {dashboard.trendingStories.map((story) => (
              <article className="trend-row" key={story.title}>
                <div>
                  <strong>{story.title}</strong>
                  <span>{story.source}</span>
                </div>
                <b>{story.trendScore}</b>
              </article>
            ))}
          </section>
        </div>
      </section>

      <section className="admin-grid">
        <form className="admin-panel" onSubmit={(event) => event.preventDefault()}>
          <h2>SEO Settings</h2>
          <label>
            Site title
            <input value={settings.siteTitle} onChange={(event) => update("siteTitle", event.target.value)} />
          </label>
          <label>
            Meta description
            <textarea
              value={settings.metaDescription}
              onChange={(event) => update("metaDescription", event.target.value)}
              rows={4}
            />
          </label>
          <label>
            Header verification or analytics script
            <textarea
              value={settings.headerScript}
              onChange={(event) => update("headerScript", event.target.value)}
              placeholder="<script>...</script>"
              rows={4}
            />
          </label>
        </form>

        <form className="admin-panel" onSubmit={(event) => event.preventDefault()}>
          <h2>Monetization</h2>
          <label>
            AdSense client ID
            <input value={settings.adsenseClient} onChange={(event) => update("adsenseClient", event.target.value)} />
          </label>
          <label>
            Sponsored briefing rate
            <input value={settings.sponsoredRate} onChange={(event) => update("sponsoredRate", event.target.value)} />
          </label>
          <label>
            Affiliate disclosure
            <textarea
              value={settings.affiliateDisclosure}
              onChange={(event) => update("affiliateDisclosure", event.target.value)}
              rows={3}
            />
          </label>
          <div className="switch-row">
            <span>Programmatic ads</span>
            <button
              type="button"
              className={settings.programmaticAds ? "toggle on" : "toggle"}
              onClick={() => update("programmaticAds", !settings.programmaticAds)}
              aria-pressed={settings.programmaticAds}
            >
              {settings.programmaticAds ? "On" : "Off"}
            </button>
          </div>
          <div className="switch-row">
            <span>Premium paywall</span>
            <button
              type="button"
              className={settings.paywallEnabled ? "toggle on" : "toggle"}
              onClick={() => update("paywallEnabled", !settings.paywallEnabled)}
              aria-pressed={settings.paywallEnabled}
            >
              {settings.paywallEnabled ? "On" : "Off"}
            </button>
          </div>
        </form>
      </section>

      <section className="admin-panel inventory">
        <div>
          <h2>Ad Inventory</h2>
          <p>Use these placements for AdSense, direct sponsorships, affiliate campaigns, or newsletter packages.</p>
        </div>
        <div className="inventory-list">
          {revenueSlots.map((slot) => (
            <article key={slot.name}>
              <strong>{slot.name}</strong>
              <span>{slot.format}</span>
              <small>
                {slot.placement} / {slot.yield} yield
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <h2>Audience Growth</h2>
        <label>
          Newsletter call to action
          <input value={settings.newsletterCta} onChange={(event) => update("newsletterCta", event.target.value)} />
        </label>
        <button className="save-button" type="button" onClick={saveSettings}>
          Save admin settings
        </button>
        {saved ? <p className="saved-note">Saved locally. Connect this form to your CMS or database when deploying.</p> : null}
      </section>
    </div>
  );
}
