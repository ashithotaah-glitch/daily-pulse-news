"use client";

import { useState } from "react";

type CopilotResponse = {
  answer: string;
  keyDevelopments: string[];
  citations: { title: string; sourceName: string; originalUrl: string }[];
  relatedStories: {
    id: string;
    title: string;
    sourceName: string;
    sourceLogo: string;
    originalUrl: string;
    aiSummary: string;
    category: string;
    trendScore: number;
    impactLevel: string;
  }[];
  grounded: boolean;
};

const EXAMPLES = ["What happened today in AI?", "Why is Nvidia trending?", "Summarize startup funding news this week."];

export function AskFlashFeed() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<CopilotResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask(value = query) {
    const prompt = value.trim();
    if (!prompt) return;
    setQuery(prompt);
    setLoading(true);
    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt })
      });
      setAnswer(await response.json());
    } catch {
      setAnswer({
        answer: "Ask FlashFeed is temporarily unavailable. Try the normal search or refresh the feed.",
        keyDevelopments: [],
        citations: [],
        relatedStories: [],
        grounded: false
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="copilot-panel" aria-label="Ask FlashFeed AI news assistant">
      <div className="copilot-heading">
        <div>
          <p className="eyebrow">Ask FlashFeed</p>
          <h2>AI news copilot</h2>
          <span>Answers use only Flash Feed aggregated stories, summaries, entities, and source links.</span>
        </div>
      </div>
      <div className="copilot-input">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && ask()}
          placeholder="Ask about today's AI, markets, geopolitics, startups..."
        />
        <button type="button" onClick={() => ask()} disabled={loading}>
          {loading ? "Thinking" : "Ask"}
        </button>
      </div>
      <div className="copilot-examples">
        {EXAMPLES.map((example) => (
          <button type="button" key={example} onClick={() => ask(example)}>
            {example}
          </button>
        ))}
      </div>
      {answer ? (
        <div className="copilot-answer">
          <strong>{answer.grounded ? "Grounded answer" : "Insufficient current data"}</strong>
          <p>{answer.answer}</p>
          {answer.keyDevelopments.length ? (
            <ul>
              {answer.keyDevelopments.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          <div className="copilot-citations">
            {answer.citations.map((citation) => (
              <a href={citation.originalUrl} target="_blank" rel="noreferrer" key={`${citation.sourceName}-${citation.title}`}>
                {citation.sourceName}: {citation.title}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
