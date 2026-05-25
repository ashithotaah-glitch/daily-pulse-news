import { NextRequest, NextResponse } from "next/server";
import { incrementAdMetric, logAnalyticsEvent } from "@/lib/admin/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  const placement = searchParams.get("placement") || id;
  const target = searchParams.get("to") || "https://flashfeed.blog";

  if (id) {
    await incrementAdMetric(id, "clicks");
    await logAnalyticsEvent({ type: "ad_click", label: placement, value: id });
  }

  return NextResponse.redirect(target);
}
