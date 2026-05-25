import { NextRequest, NextResponse } from "next/server";
import { readAdminStore, timestamp, updateAdminStore } from "@/lib/admin/store";
import type { AdSlotRecord } from "@/lib/admin/types";

export async function GET() {
  const store = await readAdminStore();
  const impressions = store.adSlots.reduce((sum, slot) => sum + slot.impressions, 0);
  const clicks = store.adSlots.reduce((sum, slot) => sum + slot.clicks, 0);
  return NextResponse.json({
    adSlots: store.adSlots,
    metrics: {
      impressions,
      clicks,
      ctr: impressions ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
      activeCampaigns: store.adSlots.filter((slot) => slot.isActive).length,
      estimatedRevenue: "₹0.00",
      topPlacements: [...store.adSlots].sort((a, b) => b.clicks - a.clicks).slice(0, 5)
    }
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const createdAt = timestamp();
  const slot: AdSlotRecord = {
    id: body.id || `ad-${Date.now()}`,
    name: body.name || "New Ad Slot",
    placement: body.placement || "feed_inline",
    device: body.device || "all",
    adType: body.adType || "image_banner",
    adCode: body.adCode || "",
    imageUrl: body.imageUrl || "",
    targetUrl: body.targetUrl || "",
    sponsorName: body.sponsorName || "",
    headline: body.headline || "",
    summary: body.summary || "",
    ctaLabel: body.ctaLabel || "Learn more",
    startDate: body.startDate || "",
    endDate: body.endDate || "",
    isActive: body.isActive ?? false,
    impressions: Number(body.impressions || 0),
    clicks: Number(body.clicks || 0),
    createdAt,
    updatedAt: createdAt
  };
  const store = await updateAdminStore((current) => {
    current.adSlots = [slot, ...current.adSlots.filter((item) => item.id !== slot.id)];
  });
  return NextResponse.json({ slot, adSlots: store.adSlots });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const store = await updateAdminStore((current) => {
    current.adSlots = current.adSlots.map((slot) => (slot.id === body.id ? { ...slot, ...body, updatedAt: timestamp() } : slot));
  });
  return NextResponse.json({ adSlots: store.adSlots });
}

export async function DELETE(request: NextRequest) {
  const id = new URL(request.url).searchParams.get("id");
  const store = await updateAdminStore((current) => {
    current.adSlots = current.adSlots.filter((slot) => slot.id !== id);
  });
  return NextResponse.json({ adSlots: store.adSlots });
}
