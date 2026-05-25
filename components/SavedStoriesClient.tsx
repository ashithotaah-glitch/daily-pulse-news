"use client";

import { useEffect, useState } from "react";

type SavedStory = {
  articleId?: string;
  clusterId?: string;
  title: string;
  source: string;
  savedAt: string;
};

const SAVED_KEY = "flashfeed.savedStories.v1";

function formatSavedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved recently";
  return `Saved ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export function SavedStoriesClient() {
  const [saved, setSaved] = useState<SavedStory[]>([]);

  useEffect(() => {
    try {
      setSaved(JSON.parse(window.localStorage.getItem(SAVED_KEY) || "[]"));
    } catch {
      setSaved([]);
    }
  }, []);

  function removeStory(story: SavedStory) {
    const next = saved.filter((item) => item.articleId !== story.articleId && item.clusterId !== story.clusterId);
    setSaved(next);
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("flashfeed:profile-changed"));
    } catch {
      // Saving can fail if browser storage is disabled; the page should remain usable.
    }
  }

  return (
    <main className="saved-page">
      <section className="saved-hero">
        <p className="eyebrow">Reading List</p>
        <h1>Saved stories</h1>
        <p>Stories saved on this device for quick return and personalization signals.</p>
      </section>

      <section className="saved-list">
        {saved.length ? (
          saved.map((story) => (
            <article key={`${story.articleId}-${story.clusterId}-${story.savedAt}`}>
              <div>
                <span>{story.source}</span>
                <h2>{story.title}</h2>
                <small>{formatSavedAt(story.savedAt)}</small>
              </div>
              <button type="button" onClick={() => removeStory(story)}>
                Remove
              </button>
            </article>
          ))
        ) : (
          <div className="saved-empty">
            <h2>No saved stories yet</h2>
            <p>Use the Save button on any story card to build your reading list and improve your personalized feed.</p>
          </div>
        )}
      </section>
    </main>
  );
}
