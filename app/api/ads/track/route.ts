import { NextRequest, NextResponse } from "next/server";
import { incrementAdMetric, logAnalyticsEvent } from "@/lib/admin/store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  const metric = body.metric === "clicks" ? "clicks" : "impressions";
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  await incrementAdMetric(id, metric);
  await logAnalyticsEvent({
    type: metric === "clicks" ? "ad_click" : "ad_impression",
    label: String(body.placement || id),
    value: id
  });

  return NextResponse.json({ ok: true });
}
