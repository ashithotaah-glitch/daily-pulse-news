import { NextRequest, NextResponse } from "next/server";
import { logAnalyticsEvent } from "@/lib/admin/store";
import type { AnalyticsEventType } from "@/lib/admin/types";

const allowedEvents: AnalyticsEventType[] = [
  "article_view",
  "source_click",
  "category_click",
  "search_query",
  "save_story",
  "ad_impression",
  "ad_click",
  "personalized_feed"
];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const type = body.type as AnalyticsEventType;
  if (!allowedEvents.includes(type)) return NextResponse.json({ ok: false }, { status: 400 });

  await logAnalyticsEvent({
    type,
    label: String(body.label || "unknown").slice(0, 240),
    value: body.value ? String(body.value).slice(0, 500) : undefined
  });

  return NextResponse.json({ ok: true });
}
