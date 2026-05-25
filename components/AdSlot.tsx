import { AdTracker } from "./AdTracker";
import { getActiveAdSlot } from "@/lib/admin/store";
import type { AdSlotRecord } from "@/lib/admin/types";

type AdSlotProps = {
  label: string;
  size: string;
  compact?: boolean;
  placement?: AdSlotRecord["placement"];
};

function safeHtml(value: string) {
  return value.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/\son\w+=["'][^"']*["']/gi, "");
}

function clickUrl(slot: AdSlotRecord) {
  return `/api/ads/click?id=${encodeURIComponent(slot.id)}&placement=${encodeURIComponent(slot.placement)}&to=${encodeURIComponent(
    slot.targetUrl || "https://flashfeed.blog"
  )}`;
}

export async function AdSlot({ label, size, compact = false, placement = "feed_inline" }: AdSlotProps) {
  const slot = await getActiveAdSlot(placement);

  if (slot?.adType === "sponsored_card") {
    return (
      <aside className="sponsored-card" aria-label={`${slot.sponsorName || slot.name} sponsored content`}>
        <AdTracker id={slot.id} placement={slot.placement} />
        <span>Sponsored{slot.sponsorName ? ` by ${slot.sponsorName}` : ""}</span>
        <strong>{slot.headline || slot.name}</strong>
        <p>{slot.summary}</p>
        <a href={clickUrl(slot)} target="_blank" rel="noreferrer">
          {slot.ctaLabel || "Learn more"}
        </a>
      </aside>
    );
  }

  if (slot?.adType === "image_banner" && slot.imageUrl) {
    return (
      <aside className={compact ? "ad-slot compact live-ad" : "ad-slot live-ad"} aria-label={`${slot.name} advertisement`}>
        <AdTracker id={slot.id} placement={slot.placement} />
        <a href={clickUrl(slot)} target="_blank" rel="noreferrer">
          <img src={slot.imageUrl} alt={slot.name} />
        </a>
      </aside>
    );
  }

  if (slot?.adType === "custom_html" && slot.adCode) {
    return (
      <aside className={compact ? "ad-slot compact live-ad" : "ad-slot live-ad"} aria-label={`${slot.name} advertisement`}>
        <AdTracker id={slot.id} placement={slot.placement} />
        {/* Custom ad HTML is stripped of script tags and inline event handlers before rendering. Prefer image banners or AdSense for production. */}
        <div dangerouslySetInnerHTML={{ __html: safeHtml(slot.adCode) }} />
      </aside>
    );
  }

  return (
    <aside className={compact ? "ad-slot compact" : "ad-slot"} aria-label={`${label} advertisement`}>
      <span>Advertisement</span>
      <strong>{label}</strong>
      <small>{size}</small>
    </aside>
  );
}
