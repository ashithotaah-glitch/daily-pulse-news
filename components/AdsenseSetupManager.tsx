"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdsenseSetup } from "@/lib/admin/types";

type Checks = {
  scriptFound: boolean;
  publisherIdFound: boolean;
  adsTxtFound: boolean;
  metaTagFound: boolean;
};

const emptySetup: AdsenseSetup = {
  publisherId: "",
  scriptSnippet: "",
  adsTxtSnippet: "",
  metaVerificationTag: "",
  metaName: "",
  metaContent: "",
  autoAdsEnabled: false,
  manualAdsEnabled: true,
  injectHeadScript: false,
  publishAdsTxt: false,
  injectMetaTag: false,
  status: "not_configured",
  updatedAt: ""
};

const checklist = [
  "AdSense code added to <head>",
  "ads.txt published",
  "Privacy Policy page exists",
  "Terms page exists",
  "Contact page exists",
  "About page exists",
  "Site has enough original/valuable content",
  "Navigation is clear",
  "No broken pages",
  "Mobile responsive"
];

function labelStatus(value: AdsenseSetup["status"]) {
  return value.replace(/_/g, " ");
}

function extractPublisherId(value: string) {
  return value.match(/ca-pub-\d{8,}/)?.[0] || "";
}

export function AdsenseSetupManager() {
  const [setup, setSetup] = useState<AdsenseSetup>(emptySetup);
  const [checks, setChecks] = useState<Checks | null>(null);
  const [status, setStatus] = useState("Loading...");
  const extractedPublisherId = useMemo(() => extractPublisherId(`${setup.publisherId} ${setup.scriptSnippet}`), [setup.publisherId, setup.scriptSnippet]);

  async function load() {
    const response = await fetch("/api/admin/adsense");
    const payload = await response.json();
    setSetup({ ...emptySetup, ...(payload.setup || {}) });
    setChecks(payload.checks || null);
    setStatus(response.ok ? "Ready" : payload.error || "Failed");
  }

  useEffect(() => {
    load();
  }, []);

  async function save(action?: string) {
    setStatus(action ? "Running action..." : "Saving...");
    const response = await fetch("/api/admin/adsense", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...setup, publisherId: extractedPublisherId || setup.publisherId, action })
    });
    const payload = await response.json();
    if (response.ok) {
      setSetup({ ...emptySetup, ...payload.setup });
      setChecks(payload.checks);
      setStatus(action ? "Action complete" : "Saved");
    } else {
      setStatus(payload.error || "Request failed");
    }
  }

  async function testInstallation() {
    setStatus("Testing public pages...");
    try {
      const [homepageResponse, adsTxtResponse] = await Promise.all([fetch("/", { cache: "no-store" }), fetch("/ads.txt", { cache: "no-store" })]);
      const homepage = await homepageResponse.text();
      const adsTxt = await adsTxtResponse.text();
      const publisher = extractedPublisherId || setup.publisherId;
      setChecks({
        scriptFound: homepage.includes("pagead2.googlesyndication.com"),
        publisherIdFound: Boolean(publisher && homepage.includes(publisher)),
        adsTxtFound: Boolean(setup.adsTxtSnippet && adsTxt.includes(setup.adsTxtSnippet.split(/\r?\n/)[0] || "google.com")),
        metaTagFound: !setup.metaName || (homepage.includes(setup.metaName) && homepage.includes(setup.metaContent))
      });
      setStatus("Installation tested");
    } catch {
      setStatus("Installation test failed");
    }
  }

  function update(key: keyof AdsenseSetup, value: string | boolean) {
    setSetup((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="admin-page">
      <section className="admin-panel resource-panel">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">Monetization</p>
            <h2>AdSense Setup</h2>
          </div>
          <span>{status}</span>
        </div>

        <div className="adsense-status-row">
          <article>
            <span>Status</span>
            <strong>{labelStatus(setup.status)}</strong>
          </article>
          <article>
            <span>Publisher ID</span>
            <strong>{extractedPublisherId || setup.publisherId || "Not detected"}</strong>
          </article>
          <article>
            <span>Injection</span>
            <strong>{setup.injectHeadScript ? "Enabled" : "Off"}</strong>
          </article>
        </div>

        <div className="adsense-form-grid">
          <label>
            Publisher ID
            <input value={setup.publisherId} onChange={(event) => update("publisherId", event.target.value)} placeholder="ca-pub-4454219093416461" />
          </label>
          <label>
            Status
            <select value={setup.status} onChange={(event) => update("status", event.target.value as AdsenseSetup["status"])}>
              <option value="not_configured">Not configured</option>
              <option value="code_added">Code added</option>
              <option value="verified">Verified</option>
              <option value="review_requested">Review requested</option>
            </select>
          </label>
          <label className="wide">
            AdSense script/code snippet
            <textarea
              value={setup.scriptSnippet}
              onChange={(event) => update("scriptSnippet", event.target.value)}
              placeholder={'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-..." crossorigin="anonymous"></script>'}
            />
          </label>
          <label className="wide">
            ads.txt snippet
            <textarea
              value={setup.adsTxtSnippet}
              onChange={(event) => update("adsTxtSnippet", event.target.value)}
              placeholder="google.com, pub-4454219093416461, DIRECT, f08c47fec0942fa0"
            />
          </label>
          <label className="wide">
            Meta verification tag
            <textarea
              value={setup.metaVerificationTag}
              onChange={(event) => update("metaVerificationTag", event.target.value)}
              placeholder={'<meta name="google-site-verification" content="..." />'}
            />
          </label>
        </div>

        <div className="settings-grid">
          {[
            ["autoAdsEnabled", "Auto Ads"],
            ["manualAdsEnabled", "Manual Ads"],
            ["injectHeadScript", "Head script"],
            ["publishAdsTxt", "ads.txt"],
            ["injectMetaTag", "Meta tag"]
          ].map(([key, label]) => (
            <button
              className={setup[key as keyof AdsenseSetup] ? "toggle on" : "toggle"}
              type="button"
              key={key}
              onClick={() => update(key as keyof AdsenseSetup, !setup[key as keyof AdsenseSetup])}
            >
              {label}: {setup[key as keyof AdsenseSetup] ? "On" : "Off"}
            </button>
          ))}
        </div>

        <div className="admin-action-row">
          <button type="button" onClick={() => save()}>Save Setup</button>
          <button type="button" onClick={() => save("inject")}>Inject to Website</button>
          <button type="button" onClick={() => save("publish-ads-txt")}>Publish ads.txt</button>
          <button type="button" onClick={testInstallation}>Test Installation</button>
          <button type="button" onClick={() => save("verified")}>Mark as Verified</button>
          <button type="button" onClick={() => save("review-requested")}>Request Review Checklist</button>
        </div>

        <section className="admin-panel mini-panel">
          <h2>Installation Check</h2>
          <div className="check-grid">
            {[
              ["Script found", checks?.scriptFound],
              ["Publisher ID found", checks?.publisherIdFound],
              ["ads.txt found", checks?.adsTxtFound],
              ["Meta tag found", checks?.metaTagFound]
            ].map(([label, ok]) => (
              <article className={ok ? "check-pass" : "check-pending"} key={String(label)}>
                <strong>{ok ? "Pass" : "Pending"}</strong>
                <span>{label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel mini-panel">
          <h2>Review Checklist</h2>
          <div className="review-checklist">
            {checklist.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <p className="saved-note">
            Custom HTML ads remain separate from this verification setup. Only Google AdSense script URLs from pagead2.googlesyndication.com are accepted here.
          </p>
        </section>
      </section>
    </main>
  );
}
