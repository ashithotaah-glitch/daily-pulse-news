import { NextResponse } from "next/server";
import { readAdminStore } from "@/lib/admin/store";
import { runNewsPipeline, sortArticles } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET() {
  const [store, result] = await Promise.all([readAdminStore(), runNewsPipeline()]);
  const topStories = sortArticles(result.articles, "trending").slice(0, 8);
  const subject = topStories[0] ? `Flash Feed Briefing: ${topStories[0].title}` : "Flash Feed Daily Briefing";
  const html = `
    <h1>Flash Feed Daily Briefing</h1>
    <p>${topStories.length} stories across ${new Set(topStories.map((story) => story.category)).size} categories.</p>
    ${topStories
      .map(
        (story) => `
          <article>
            <h2><a href="${story.originalUrl}">${story.title}</a></h2>
            <p>${story.aiSummary}</p>
            <small>${story.sourceName} / ${story.category}</small>
          </article>
        `
      )
      .join("")}
  `;

  return NextResponse.json({
    subject,
    html,
    text: topStories.map((story) => `${story.title} - ${story.sourceName}: ${story.aiSummary}`).join("\n\n"),
    subscribersCount: store.newsletterSubscribers.filter((subscriber) => subscriber.status === "active").length
  });
}
