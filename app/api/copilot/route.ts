import { NextRequest, NextResponse } from "next/server";
import { answerCopilotQuery, runNewsPipeline } from "@/lib/news";
import { logAnalyticsEvent } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const query = String(body.query || "").trim();
  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const result = await runNewsPipeline();
  const answer = await answerCopilotQuery(query, result);
  await logAnalyticsEvent({ type: "search_query", label: query, value: answer.grounded ? "copilot-grounded" : "copilot-insufficient" });

  return NextResponse.json({
    updatedAt: result.fetchedAt,
    query,
    ...answer
  });
}
