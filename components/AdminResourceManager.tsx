"use client";

import { useEffect, useState } from "react";
import type { AdSlotRecord, AIAdminSettings, ManagedCategory, ManagedSource } from "@/lib/admin/types";

type Mode = "sources" | "articles" | "categories" | "ai" | "analytics" | "monetization" | "settings";

const emptySource = {
  name: "",
  url: "",
  type: "generic-rss",
  category: "top",
  region: "global",
  language: "en",
  enabled: true,
  credibilityScore: 70
};

const emptyAd = {
  name: "",
  placement: "feed_inline",
  device: "all",
  adType: "image_banner",
  imageUrl: "",
  targetUrl: "",
  sponsorName: "",
  headline: "",
  summary: "",
  ctaLabel: "Learn more",
  adCode: "",
  isActive: false
};

export function AdminResourceManager({ mode }: { mode: Mode }) {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState("Loading...");
  const [sourceForm, setSourceForm] = useState<Record<string, any>>(emptySource);
  const [categoryForm, setCategoryForm] = useState<Record<string, any>>({ name: "", slug: "", description: "", enabled: true, homepageVisible: true });
  const [adForm, setAdForm] = useState<Record<string, any>>(emptyAd);

  const endpoint =
    mode === "settings"
      ? "/api/admin/ai"
      : mode === "monetization"
        ? "/api/admin/monetization"
        : `/api/admin/${mode}`;

  async function load() {
    setStatus("Loading...");
    const response = await fetch(endpoint);
    const payload = await response.json();
    setData(payload);
    setStatus(response.ok ? "Ready" : payload.error || "Failed");
  }

  useEffect(() => {
    load();
  }, [endpoint]);

  async function send(method: string, body?: unknown, url = endpoint) {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    setStatus(response.ok ? "Saved" : "Request failed");
    await load();
  }

  if (mode === "sources") {
    const sources = (data?.sources || []) as ManagedSource[];
    return (
      <AdminPanel title="Source Management" status={status}>
        <div className="admin-form-row">
          <input placeholder="Source name" value={sourceForm.name} onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })} />
          <input placeholder="RSS/API URL" value={sourceForm.url} onChange={(e) => setSourceForm({ ...sourceForm, url: e.target.value })} />
          <select value={sourceForm.category} onChange={(e) => setSourceForm({ ...sourceForm, category: e.target.value })}>
            {["top", "technology", "business", "finance", "geopolitics", "entertainment", "sports", "science", "health", "world"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button type="button" onClick={() => send("POST", sourceForm)}>Add source</button>
        </div>
        <div className="admin-table">
          {sources.map((source) => (
            <article key={source.id}>
              <div>
                <strong>{source.name}</strong>
                <span>{source.category} / {source.type} / credibility {source.credibilityScore}</span>
                <small>{source.lastStatus}: {source.lastError || source.url}</small>
              </div>
              <div>
                <button type="button" onClick={() => send("PATCH", { id: source.id, enabled: !source.enabled })}>{source.enabled ? "Disable" : "Enable"}</button>
                <button type="button" onClick={() => send("PUT", { id: source.id })}>Test</button>
                <button type="button" onClick={() => send("DELETE", undefined, `${endpoint}?id=${source.id}`)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </AdminPanel>
    );
  }

  if (mode === "articles") {
    const articles = data?.articles || [];
    return (
      <AdminPanel title="Article Moderation" status={status}>
        <div className="admin-table">
          {articles.map((article: any) => (
            <article key={article.id}>
              <div>
                <strong>{article.title}</strong>
                <span>{article.sourceName} / {article.category} / cluster {article.cluster?.sourcesCount || 1} sources</span>
                <small>{article.aiSummary}</small>
              </div>
              <div>
                {[
                  ["isHidden", "Hide"],
                  ["isFeatured", "Feature"],
                  ["isPinned", "Pin"],
                  ["isLowQuality", "Low quality"]
                ].map(([key, label]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => send("PATCH", { articleId: article.id, ...article.moderation, [key]: !article.moderation[key] })}
                  >
                    {article.moderation[key] ? `Undo ${label}` : label}
                  </button>
                ))}
                <a href={article.originalUrl} target="_blank" rel="noreferrer">Source</a>
              </div>
            </article>
          ))}
        </div>
      </AdminPanel>
    );
  }

  if (mode === "categories") {
    const categories = (data?.categories || []) as ManagedCategory[];
    return (
      <AdminPanel title="Category Management" status={status}>
        <div className="admin-form-row">
          <input placeholder="Name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
          <input placeholder="Slug" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} />
          <input placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
          <button type="button" onClick={() => send("POST", categoryForm)}>Add category</button>
        </div>
        <div className="admin-table">
          {categories.map((category) => (
            <article key={category.id}>
              <div>
                <strong>{category.name}</strong>
                <span>{category.slug} / order {category.sortOrder}</span>
                <small>{category.seoTitle}</small>
              </div>
              <div>
                <button type="button" onClick={() => send("PATCH", { id: category.id, enabled: !category.enabled })}>{category.enabled ? "Disable" : "Enable"}</button>
                <button type="button" onClick={() => send("PATCH", { id: category.id, homepageVisible: !category.homepageVisible })}>{category.homepageVisible ? "Hide home" : "Show home"}</button>
                <button type="button" onClick={() => send("DELETE", undefined, `${endpoint}?id=${category.id}`)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </AdminPanel>
    );
  }

  if (mode === "ai" || mode === "settings") {
    const settings = (data?.settings || {}) as AIAdminSettings;
    return (
      <AdminPanel title={mode === "settings" ? "Platform Settings" : "AI Control Panel"} status={status}>
        <div className="settings-grid">
          {[
            ["summariesEnabled", "AI summaries"],
            ["whyItMattersEnabled", "Why it matters"],
            ["entityExtractionEnabled", "Entity extraction"],
            ["sentimentEnabled", "Sentiment"],
            ["trendScoringEnabled", "Trend scoring"]
          ].map(([key, label]) => (
            <button type="button" className={settings[key as keyof AIAdminSettings] ? "toggle on" : "toggle"} key={key} onClick={() => send("PATCH", { [key]: !settings[key as keyof AIAdminSettings] })}>
              {label}: {settings[key as keyof AIAdminSettings] ? "On" : "Off"}
            </button>
          ))}
          <label>Model name<input value={settings.modelName || ""} onChange={(e) => send("PATCH", { modelName: e.target.value })} /></label>
          <label>Max articles per run<input type="number" value={settings.maxArticlesPerRun || 0} onChange={(e) => send("PATCH", { maxArticlesPerRun: Number(e.target.value) })} /></label>
        </div>
        <div className="dashboard-stat-grid">
          <article><span>AI usage count</span><strong>{settings.usageCount || 0}</strong><small>Stored counter placeholder</small></article>
          <article><span>Failed AI jobs</span><strong>{settings.failedJobs || 0}</strong><small>Retry clears failed queue</small></article>
        </div>
        <button className="save-button" type="button" onClick={() => send("POST")}>Retry failed AI jobs</button>
      </AdminPanel>
    );
  }

  if (mode === "analytics") {
    return (
      <AdminPanel title="Analytics" status={status}>
        <div className="dashboard-stat-grid">
          <article><span>Saved stories</span><strong>{data?.savedStoryCounts || 0}</strong><small>Tracked browser events</small></article>
          <article><span>Personalized feed usage</span><strong>{data?.personalizedFeedUsage || 0}</strong><small>Event based</small></article>
          <article><span>AI search usage</span><strong>{data?.aiSearchUsage || 0}</strong><small>Search queries</small></article>
        </div>
        <InsightList title="Top viewed articles" items={data?.topViewedArticles || []} />
        <InsightList title="Top clicked sources" items={data?.topClickedSources || []} />
        <InsightList title="Top search queries" items={data?.topSearchQueries || []} />
      </AdminPanel>
    );
  }

  const adSlots = (data?.adSlots || []) as AdSlotRecord[];
  return (
    <AdminPanel title="Monetization" status={status}>
      <div className="dashboard-stat-grid">
        <article><span>Impressions</span><strong>{data?.metrics?.impressions || 0}</strong><small>Total ad impressions</small></article>
        <article><span>Clicks</span><strong>{data?.metrics?.clicks || 0}</strong><small>Total ad clicks</small></article>
        <article><span>CTR</span><strong>{data?.metrics?.ctr || 0}%</strong><small>Click-through rate</small></article>
        <article><span>Revenue</span><strong>{data?.metrics?.estimatedRevenue || "₹0.00"}</strong><small>Placeholder</small></article>
      </div>
      <div className="admin-form-row monetization-form">
        {["name", "imageUrl", "targetUrl", "sponsorName", "headline"].map((field) => (
          <input key={field} placeholder={field} value={adForm[field] || ""} onChange={(e) => setAdForm({ ...adForm, [field]: e.target.value })} />
        ))}
        <select value={adForm.placement} onChange={(e) => setAdForm({ ...adForm, placement: e.target.value })}>
          {["homepage_top", "feed_inline", "sidebar", "article_top", "article_bottom", "mobile_sticky", "newsletter"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={adForm.adType} onChange={(e) => setAdForm({ ...adForm, adType: e.target.value })}>
          {["adsense", "custom_html", "image_banner", "sponsored_card", "newsletter_sponsor"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <textarea placeholder="Summary or custom HTML" value={adForm.summary || adForm.adCode || ""} onChange={(e) => setAdForm({ ...adForm, summary: e.target.value, adCode: e.target.value })} />
        <button type="button" onClick={() => send("POST", adForm)}>Create ad slot</button>
      </div>
      <div className="admin-table">
        {adSlots.map((slot) => (
          <article key={slot.id}>
            <div>
              <strong>{slot.name}</strong>
              <span>{slot.placement} / {slot.adType} / {slot.device}</span>
              <small>{slot.impressions} impressions / {slot.clicks} clicks</small>
            </div>
            <div>
              <button type="button" onClick={() => send("PATCH", { id: slot.id, isActive: !slot.isActive })}>{slot.isActive ? "Deactivate" : "Activate"}</button>
              <button type="button" onClick={() => send("DELETE", undefined, `${endpoint}?id=${slot.id}`)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </AdminPanel>
  );
}

function AdminPanel({ title, status, children }: { title: string; status: string; children: React.ReactNode }) {
  return (
    <main className="admin-page">
      <section className="admin-panel resource-panel">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">Admin</p>
            <h2>{title}</h2>
          </div>
          <span>{status}</span>
        </div>
        {children}
      </section>
    </main>
  );
}

function InsightList({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  return (
    <section className="admin-panel mini-panel">
      <h2>{title}</h2>
      <div className="admin-table compact-table">
        {items.length ? items.map((item) => (
          <article key={item.label}><strong>{item.label}</strong><span>{item.count}</span></article>
        )) : <p className="saved-note">No events yet.</p>}
      </div>
    </section>
  );
}
