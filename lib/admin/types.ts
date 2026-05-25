import type { NewsCategory, SourceAdapterType } from "@/lib/news";

export type ManagedSource = {
  id: string;
  name: string;
  type: SourceAdapterType;
  url: string;
  category: NewsCategory;
  region: string;
  language: string;
  enabled: boolean;
  credibilityScore: number;
  lastFetchedAt: string;
  lastStatus: "ok" | "failed" | "unknown";
  lastError: string;
  createdAt: string;
  updatedAt: string;
};

export type ArticleModeration = {
  articleId: string;
  isHidden: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  isLowQuality: boolean;
  moderationStatus: "approved" | "review" | "rejected";
  adminNotes: string;
  updatedAt: string;
};

export type ManagedCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  enabled: boolean;
  homepageVisible: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
};

export type AIAdminSettings = {
  summariesEnabled: boolean;
  whyItMattersEnabled: boolean;
  entityExtractionEnabled: boolean;
  sentimentEnabled: boolean;
  trendScoringEnabled: boolean;
  modelName: string;
  maxArticlesPerRun: number;
  usageCount: number;
  failedJobs: number;
};

export type AnalyticsEventType =
  | "article_view"
  | "source_click"
  | "category_click"
  | "search_query"
  | "save_story"
  | "ad_impression"
  | "ad_click"
  | "personalized_feed";

export type AnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  label: string;
  value?: string;
  createdAt: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  topics: string[];
  source: string;
  status: "active" | "unsubscribed";
  createdAt: string;
  updatedAt: string;
};

export type AdSlotRecord = {
  id: string;
  name: string;
  placement:
    | "homepage_top"
    | "feed_inline"
    | "sidebar"
    | "article_top"
    | "article_bottom"
    | "mobile_sticky"
    | "newsletter";
  device: "all" | "desktop" | "mobile";
  adType: "adsense" | "custom_html" | "image_banner" | "sponsored_card" | "newsletter_sponsor";
  adCode: string;
  imageUrl: string;
  targetUrl: string;
  sponsorName: string;
  headline: string;
  summary: string;
  ctaLabel: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminStore = {
  sources: ManagedSource[];
  categories: ManagedCategory[];
  articleModeration: ArticleModeration[];
  aiSettings: AIAdminSettings;
  events: AnalyticsEvent[];
  adSlots: AdSlotRecord[];
  newsletterSubscribers: NewsletterSubscriber[];
};
