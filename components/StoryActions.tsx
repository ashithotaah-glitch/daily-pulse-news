"use client";

import type { NewsItem } from "@/lib/news";

const FOLLOW_KEY = "flashfeed.followedTopics.v1";

function readTopics() {
  try {
    return JSON.parse(window.localStorage.getItem(FOLLOW_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

export function StoryActions({ item }: { item: NewsItem }) {
  const storyPath = `/story/${encodeURIComponent(item.clusterId)}`;
  const publicShareUrl = `https://flashfeed.blog${storyPath}`;
  const topic = item.tags[0] || item.category;

  function followTopic() {
    const topics = readTopics();
    const next = [...new Set([topic, ...topics])].slice(0, 50);
    window.localStorage.setItem(FOLLOW_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("flashfeed:profile-changed"));
  }

  async function nativeShare() {
    const shareUrl = `${window.location.origin}${storyPath}`;
    if (navigator.share) {
      await navigator.share({ title: item.title, text: item.aiSummary, url: shareUrl });
      return;
    }
    await navigator.clipboard?.writeText(shareUrl);
  }

  return (
    <div className="story-actions">
      <button type="button" onClick={nativeShare}>Share</button>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(publicShareUrl)}`} target="_blank" rel="noreferrer">X</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicShareUrl)}`} target="_blank" rel="noreferrer">LinkedIn</a>
      <button type="button" onClick={followTopic}>Follow {topic}</button>
    </div>
  );
}
