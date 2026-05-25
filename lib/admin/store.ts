import { promises as fs } from "fs";
import path from "path";
import { categories, sourceConfigs } from "@/lib/news";
import type { AdminStore, AdSlotRecord, AnalyticsEvent, ManagedCategory, ManagedSource } from "./types";

const STORE_PATH = path.join(process.cwd(), "data", "admin-store.json");

function now() {
  return new Date().toISOString();
}

function defaultSources(): ManagedSource[] {
  return sourceConfigs.map((source) => ({
    id: source.id,
    name: source.name,
    type: source.adapter,
    url: source.url,
    category: source.category,
    region: source.region || "global",
    language: source.language || "en",
    enabled: source.enabled !== false,
    credibilityScore: Math.round((source.credibility ?? 0.65) * 100),
    lastFetchedAt: "",
    lastStatus: "unknown",
    lastError: "",
    createdAt: now(),
    updatedAt: now()
  }));
}

function defaultCategories(): ManagedCategory[] {
  return categories.map((category, index) => ({
    id: category.id,
    name: category.label,
    slug: category.id,
    description: `${category.label} news, analysis, and fast briefings.`,
    enabled: true,
    homepageVisible: true,
    sortOrder: index,
    seoTitle: `${category.label} News | Flash Feed`,
    seoDescription: `Latest ${category.label.toLowerCase()} headlines, summaries, and source-linked updates from Flash Feed.`
  }));
}

function defaultAdSlots(): AdSlotRecord[] {
  const createdAt = now();
  return [
    {
      id: "homepage-top-default",
      name: "Homepage Top Placeholder",
      placement: "homepage_top",
      device: "all",
      adType: "adsense",
      adCode: "",
      imageUrl: "",
      targetUrl: "",
      sponsorName: "",
      headline: "",
      summary: "",
      ctaLabel: "Learn more",
      startDate: "",
      endDate: "",
      isActive: false,
      impressions: 0,
      clicks: 0,
      createdAt,
      updatedAt: createdAt
    }
  ];
}

function defaultStore(): AdminStore {
  return {
    sources: defaultSources(),
    categories: defaultCategories(),
    articleModeration: [],
    aiSettings: {
      summariesEnabled: true,
      whyItMattersEnabled: true,
      entityExtractionEnabled: true,
      sentimentEnabled: true,
      trendScoringEnabled: true,
      modelName: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      maxArticlesPerRun: Number(process.env.MAX_PIPELINE_ARTICLES || 72),
      usageCount: 0,
      failedJobs: 0
    },
    events: [],
    adSlots: defaultAdSlots()
  };
}

async function ensureDataDir() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
}

export async function readAdminStore(): Promise<AdminStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return { ...defaultStore(), ...JSON.parse(raw) };
  } catch {
    const store = defaultStore();
    await writeAdminStore(store);
    return store;
  }
}

export async function writeAdminStore(store: AdminStore) {
  await ensureDataDir();
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

export async function updateAdminStore(updater: (store: AdminStore) => AdminStore | void) {
  const store = await readAdminStore();
  const next = updater(store) || store;
  await writeAdminStore(next);
  return next;
}

export async function logAnalyticsEvent(event: Omit<AnalyticsEvent, "id" | "createdAt">) {
  await updateAdminStore((store) => {
    store.events = [
      {
        ...event,
        id: `event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: now()
      },
      ...store.events
    ].slice(0, 2000);
  });
}

export async function getActiveAdSlot(placement: AdSlotRecord["placement"]) {
  const store = await readAdminStore();
  const current = Date.now();
  return store.adSlots.find((slot) => {
    const startsOk = !slot.startDate || Date.parse(slot.startDate) <= current;
    const endsOk = !slot.endDate || Date.parse(slot.endDate) >= current;
    return slot.placement === placement && slot.isActive && startsOk && endsOk;
  });
}

export async function incrementAdMetric(id: string, metric: "impressions" | "clicks") {
  await updateAdminStore((store) => {
    const slot = store.adSlots.find((item) => item.id === id);
    if (slot) {
      slot[metric] += 1;
      slot.updatedAt = now();
    }
  });
}

export function timestamp() {
  return now();
}
