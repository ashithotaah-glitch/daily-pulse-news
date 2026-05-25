import { NextRequest, NextResponse } from "next/server";
import { addNewsletterSubscriber, logAnalyticsEvent } from "@/lib/admin/store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  try {
    const subscriber = await addNewsletterSubscriber(String(body.email || ""), Array.isArray(body.topics) ? body.topics : [], body.source || "newsletter");
    await logAnalyticsEvent({ type: "personalized_feed", label: "newsletter_signup", value: subscriber?.email });
    return NextResponse.json({ ok: true, subscriber });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Subscription failed" }, { status: 400 });
  }
}
