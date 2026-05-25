"use client";

import { useEffect } from "react";

export function AdTracker({ id, placement }: { id: string; placement: string }) {
  useEffect(() => {
    navigator.sendBeacon?.(
      "/api/ads/track",
      new Blob([JSON.stringify({ id, placement, metric: "impressions" })], { type: "application/json" })
    );
  }, [id, placement]);

  return null;
}

export function trackAdClick(id: string, placement: string) {
  navigator.sendBeacon?.(
    "/api/ads/track",
    new Blob([JSON.stringify({ id, placement, metric: "clicks" })], { type: "application/json" })
  );
}
