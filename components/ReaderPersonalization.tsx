"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, type NewsCategory, type NewsItem } from "@/lib/news";
import { NewsCard } from "./NewsCard";

type Briefing = {
  briefing: string;
  topStories: NewsItem[];
  keyPoints: string[];
  whyItMatters: string;
  whatToWatchNext: string[];
};

type SearchResult = {
  answer: string;
  citations: { title: string; sourceName: string; originalUrl: string }[];
  articles: NewsItem[];
};

type ReaderProfile = {
  categories: NewsCategory[];
  topics: string[];
  saved: unknown[];
  history: unknown[];
};

const PREF_KEY = "flashfeed.preferences.v1";
const SAVED_KEY = "flashfeed.savedStories.v1";
const HISTORY_KEY = "flashfeed.readingHistory.v1";
const PRESET_TOPICS = ["AI", "India", "Markets", "Apple", "OpenAI", "Startups", "Policy", "Climate", "Streaming", "Cybersecurity"];

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function profilePayload(categoriesValue: NewsCategory[], topics: string[]): ReaderProfile {
  return {
    categories: categoriesValue,
    topics,
    saved: readJson<unknown[]>(SAVED_KEY, []),
    history: readJson<unknown[]>(HISTORY_KEY, [])
  };
}

export function ReaderPersonalization({ initialArticles }: { initialArticles: NewsItem[] }) {
  const [activeTab, setActiveTab] = useState<"personalized" | "briefing" | "search">("personalized");
  const [selectedCategories, setSelectedCategories] = useState<NewsCategory[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [showPreferences, setShowPreferences] = useState(false);
  const [personalized, setPersonalized] = useState<NewsItem[]>(initialArticles.slice(0, 6));
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchResult | null>(null);
  const [status, setStatus] = useState("Personalized ranking is ready.");
  const [profileVersion, setProfileVersion] = useState(0);

  const profile = useMemo(() => profilePayload(selectedCategories, selectedTopics), [selectedCategories, selectedTopics, profileVersion]);
  const encodedProfile = useMemo(() => encodeURIComponent(JSON.stringify(profile)), [profile]);

  useEffect(() => {
    const stored = readJson<{ categories: NewsCategory[]; topics: string[] }>(PREF_KEY, { categories: [], topics: [] });
    setSelectedCategories(stored.categories || []);
    setSelectedTopics(stored.topics || []);
    setShowPreferences(!stored.categories?.length && !stored.topics?.length);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PREF_KEY, JSON.stringify({ categories: selectedCategories, topics: selectedTopics }));
  }, [selectedCategories, selectedTopics]);

  useEffect(() => {
    let ignore = false;

    async function loadPersonalized() {
      try {
        const response = await fetch(`/api/feed/personalized?profile=${encodedProfile}`);
        const data = await response.json();
        if (!ignore) {
          setPersonalized(data.articles?.slice(0, 6) || initialArticles.slice(0, 6));
          setStatus(data.personalized ? "Ranked from your interests, saves, history, trends, and recency." : "Showing trending feed until you add interests.");
        }
      } catch {
        if (!ignore) setPersonalized(initialArticles.slice(0, 6));
      }
    }

    loadPersonalized();
    const refresh = () => setProfileVersion((version) => version + 1);
    window.addEventListener("flashfeed:profile-changed", refresh);
    return () => {
      ignore = true;
      window.removeEventListener("flashfeed:profile-changed", refresh);
    };
  }, [encodedProfile, initialArticles]);

  useEffect(() => {
    let ignore = false;

    async function loadBriefing() {
      try {
        const response = await fetch(`/api/briefing/personalized?profile=${encodedProfile}`);
        const data = await response.json();
        if (!ignore) setBriefing(data);
      } catch {
        if (!ignore) setBriefing(null);
      }
    }

    loadBriefing();
    return () => {
      ignore = true;
    };
  }, [encodedProfile]);

  function toggleCategory(category: NewsCategory) {
    setSelectedCategories((current) => (current.includes(category) ? current.filter((item) => item !== category) : [...current, category]));
  }

  function toggleTopic(topic: string) {
    setSelectedTopics((current) => (current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic]));
  }

  function addCustomTopic() {
    const topic = customTopic.trim();
    if (!topic) return;
    setSelectedTopics((current) => [...new Set([topic, ...current])].slice(0, 20));
    setCustomTopic("");
  }

  async function runSearch() {
    const value = query.trim();
    if (!value) return;
    setActiveTab("search");
    try {
      const response = await fetch(`/api/search/ai?q=${encodeURIComponent(value)}`);
      setSearch(await response.json());
    } catch {
      setSearch({
        answer: "AI search is unavailable, so Flash Feed is showing normal current-story matches.",
        citations: [],
        articles: initialArticles.filter((article) => article.title.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
      });
    }
  }

  return (
    <section className="reader-intel" aria-label="Personalized Flash Feed">
      <div className="reader-intel-header">
        <div>
          <p className="eyebrow">For You</p>
          <h2>Personal news intelligence</h2>
          <span>{status}</span>
        </div>
        <button type="button" onClick={() => setShowPreferences(true)}>
          Tune interests
        </button>
      </div>

      <div className="reader-search">
        <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && runSearch()} placeholder="Ask Flash Feed about today's news" />
        <button type="button" onClick={runSearch}>
          Search
        </button>
      </div>

      <div className="personal-tabs" role="tablist" aria-label="Personalized views">
        {[
          ["personalized", "Personalized Feed"],
          ["briefing", "AI Briefing"],
          ["search", "AI Search"]
        ].map(([id, label]) => (
          <button className={activeTab === id ? "active" : ""} type="button" key={id} onClick={() => setActiveTab(id as typeof activeTab)}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "personalized" && (
        <div className="story-grid instant-grid">
          {personalized.map((item) => (
            <NewsCard item={item} key={item.id} />
          ))}
        </div>
      )}

      {activeTab === "briefing" && (
        <div className="ai-briefing-panel">
          <div>
            <h3>{briefing?.briefing || "Preparing your AI briefing..."}</h3>
            <p>{briefing?.whyItMatters}</p>
          </div>
          <ul>
            {(briefing?.keyPoints || []).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <div className="watch-list">
            {(briefing?.whatToWatchNext || []).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      )}

      {activeTab === "search" && (
        <div className="search-results">
          <p>{search?.answer || "Search answers use only Flash Feed's aggregated articles, source names, summaries, and original links."}</p>
          <div className="citation-list">
            {(search?.citations || []).map((citation) => (
              <a href={citation.originalUrl} target="_blank" rel="noreferrer" key={`${citation.sourceName}-${citation.title}`}>
                {citation.sourceName}: {citation.title}
              </a>
            ))}
          </div>
          <div className="story-grid instant-grid">
            {(search?.articles || []).map((item) => (
              <NewsCard item={item} key={item.id} />
            ))}
          </div>
        </div>
      )}

      {showPreferences && (
        <div className="preference-modal" role="dialog" aria-modal="true" aria-label="Choose news interests">
          <div className="preference-card">
            <div className="modal-heading">
              <h2>Choose your interests</h2>
              <button type="button" onClick={() => setShowPreferences(false)} aria-label="Close preferences">
                Close
              </button>
            </div>
            <p>These choices stay in your browser and help rank Flash Feed stories for this device.</p>
            <div className="preference-group">
              <strong>Categories</strong>
              <div>
                {categories.filter((category) => category.id !== "top").map((category) => (
                  <button className={selectedCategories.includes(category.id) ? "selected" : ""} type="button" onClick={() => toggleCategory(category.id)} key={category.id}>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="preference-group">
              <strong>Topics</strong>
              <div>
                {PRESET_TOPICS.map((topic) => (
                  <button className={selectedTopics.includes(topic) ? "selected" : ""} type="button" onClick={() => toggleTopic(topic)} key={topic}>
                    {topic}
                  </button>
                ))}
              </div>
              <div className="custom-topic">
                <input value={customTopic} onChange={(event) => setCustomTopic(event.target.value)} placeholder="Add topic" />
                <button type="button" onClick={addCustomTopic}>
                  Add
                </button>
              </div>
            </div>
            <button className="save-preferences" type="button" onClick={() => setShowPreferences(false)}>
              Save preferences
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
