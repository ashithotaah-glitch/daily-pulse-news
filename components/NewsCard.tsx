"use client";

import type { NewsItem } from "@/lib/news";
import { StoryActions } from "./StoryActions";

const SAVED_KEY = "flashfeed.savedStories.v1";
const HISTORY_KEY = "flashfeed.readingHistory.v1";

function relativeTime(value: string) {
  const published = Date.parse(value);
  if (Number.isNaN(published)) return "Just now";

  const diffMinutes = Math.max(1, Math.round((Date.now() - published) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, value: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("flashfeed:profile-changed"));
  } catch {
    // localStorage can fail in private browsing; the article card should still work.
  }
}

function logEvent(type: string, label: string, value?: string) {
  try {
    navigator.sendBeacon?.(
      "/api/events",
      new Blob([JSON.stringify({ type, label, value })], { type: "application/json" })
    );
  } catch {
    // Analytics must never block reading or saving a story.
  }
}

export function NewsCard({
  item,
  feature = false,
  relatedSourcesCount = 1
}: {
  item: NewsItem;
  feature?: boolean;
  relatedSourcesCount?: number;
}) {
  function trackOpen(topic?: string) {
    logEvent("article_view", item.title, item.id);
    logEvent("source_click", item.sourceName, item.originalUrl);
    const history = readList<{
      articleId?: string;
      clusterId?: string;
      category?: string;
      source?: string;
      topic?: string;
      openedAt: string;
    }>(HISTORY_KEY);
    writeList(HISTORY_KEY, [
      ...history,
      {
        articleId: item.id,
        clusterId: item.clusterId,
        category: item.category,
        source: item.sourceName,
        topic,
        openedAt: new Date().toISOString()
      }
    ].slice(-200));
  }

  function saveStory() {
    const saved = readList<{
      articleId?: string;
      clusterId?: string;
      title: string;
      source: string;
      savedAt: string;
    }>(SAVED_KEY);
    const exists = saved.some((story) => story.articleId === item.id || story.clusterId === item.clusterId);
    const next = exists
      ? saved.filter((story) => story.articleId !== item.id && story.clusterId !== item.clusterId)
      : [
          {
            articleId: item.id,
            clusterId: item.clusterId,
            title: item.title,
            source: item.sourceName,
            savedAt: new Date().toISOString()
          },
          ...saved
        ].slice(0, 100);
    writeList(SAVED_KEY, next);
    if (!exists) logEvent("save_story", item.title, item.id);
  }

  return (
    <article className={feature ? "news-card feature" : "news-card"}>
      <a className="image-link" href={item.originalUrl} target="_blank" rel="noreferrer" aria-label={item.title} onClick={() => trackOpen()}>
        <span style={{ backgroundImage: `url(${item.imageUrl})` }} />
      </a>
      <div className="news-card-body">
        <div className="story-meta">
          <a className="category-pill" href={`/category/${item.category}`}>
            {item.category.replace("-", " ")}
          </a>
          <span className="source-line">
            <img src={item.sourceLogo} alt="" />
            <a href={`/source/${item.sourceName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{item.sourceName}</a>
            <time dateTime={item.publishedAt}>{relativeTime(item.publishedAt)}</time>
          </span>
        </div>
        <h3>
          <a href={item.originalUrl} target="_blank" rel="noreferrer" onClick={() => trackOpen()}>
            {item.title}
          </a>
        </h3>
        <p>
          <span className="ai-label">AI Summary:</span>
          {item.aiSummary}
        </p>
        <p className="why-it-matters">
          <span>Why it matters:</span>
          {item.whyItMatters}
        </p>
        <footer className="card-intel">
          <span className={`impact ${item.impactLevel}`}>{item.impactLevel} impact</span>
          <span>Trend {item.trendScore}</span>
          <span>{relatedSourcesCount} source{relatedSourcesCount === 1 ? "" : "s"}</span>
        </footer>
        <div className="card-actions">
          <button className="bookmark-button" type="button" onClick={saveStory} aria-label={`Save ${item.title}`}>
            Save
          </button>
          <a className="read-source" href={item.originalUrl} target="_blank" rel="noreferrer" onClick={() => trackOpen(item.tags[0])}>
            Read Source
          </a>
        </div>
        <StoryActions item={item} />
      </div>
    </article>
  );
}
