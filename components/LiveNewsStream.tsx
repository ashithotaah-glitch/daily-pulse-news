"use client";

import { useEffect, useMemo, useState } from "react";
import type { LiveSnapshot, NewsItem } from "@/lib/news";
import { NewsCard } from "./NewsCard";

type Props = {
  initialStories: NewsItem[];
  initialTicker: string[];
};

function storySignature(stories: NewsItem[]) {
  return stories.map((story) => story.id).join("|");
}

export function LiveNewsStream({ initialStories, initialTicker }: Props) {
  const [stories, setStories] = useState<NewsItem[]>(initialStories.slice(0, 6));
  const [ticker, setTicker] = useState(initialTicker);
  const [breakingCount, setBreakingCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const tickerText = useMemo(() => (ticker.length ? ticker.join("  /  ") : "Flash Feed live stream is warming up"), [ticker]);

  useEffect(() => {
    let currentSignature = storySignature(stories);
    const source = new EventSource("/api/live/stream");

    source.addEventListener("open", () => setIsLive(true));
    source.addEventListener("error", () => setIsLive(false));

    function handleMessage(event: MessageEvent) {
      const snapshot = JSON.parse(event.data) as LiveSnapshot;
      const nextStories = snapshot.liveStories.slice(0, 6);
      const nextSignature = storySignature(nextStories);
      if (nextSignature !== currentSignature) {
        const newIds = new Set(stories.map((story) => story.id));
        setPendingCount(nextStories.filter((story) => !newIds.has(story.id)).length);
        setStories(nextStories);
        currentSignature = nextSignature;
      }
      setTicker(snapshot.ticker);
      setBreakingCount(snapshot.breakingStories.length);
      setLastUpdated(new Date(snapshot.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

      if (snapshot.breakingStories[0] && Notification.permission === "granted") {
        new Notification("Flash Feed breaking update", {
          body: snapshot.breakingStories[0].title,
          tag: snapshot.breakingStories[0].id
        });
      }
    }

    source.addEventListener("snapshot", handleMessage as EventListener);
    source.addEventListener("update", handleMessage as EventListener);

    return () => {
      source.close();
    };
  }, []);

  return (
    <section className="live-module" aria-label="Realtime Flash Feed updates">
      <div className="live-ticker">
        <span className={isLive ? "live-badge on" : "live-badge"}>{isLive ? "LIVE" : "SYNC"}</span>
        <div>
          <p>{tickerText}</p>
        </div>
      </div>
      <div className="live-module-heading">
        <div>
          <p className="eyebrow">Realtime stream</p>
          <h2>Live intelligence feed</h2>
          <span>{lastUpdated ? `Updated ${lastUpdated}` : "Connecting to live stream..."}</span>
        </div>
        <button type="button" onClick={() => setPendingCount(0)} aria-label="Mark live stories as seen">
          {pendingCount ? `${pendingCount} new stories available` : breakingCount ? `${breakingCount} breaking signals` : "Watching"}
        </button>
      </div>
      <div className="story-grid instant-grid live-story-grid">
        {stories.map((story, index) => (
          <div className={index < pendingCount ? "live-insert" : ""} key={story.id}>
            <NewsCard item={story} />
          </div>
        ))}
      </div>
    </section>
  );
}
