import type { AdsenseSetup } from "./types";

export const ADSENSE_SCRIPT_HOST = "pagead2.googlesyndication.com";

export function extractPublisherId(value: string) {
  return value.match(/ca-pub-\d{8,}/)?.[0] || "";
}

export function extractPubId(value: string) {
  return extractPublisherId(value).replace("ca-", "");
}

export function sanitizeAdsenseScript(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!trimmed.includes(ADSENSE_SCRIPT_HOST)) {
    throw new Error("AdSense script must come from pagead2.googlesyndication.com");
  }
  const publisherId = extractPublisherId(trimmed);
  if (!publisherId.startsWith("ca-pub-")) {
    throw new Error("AdSense script must include a ca-pub- publisher ID");
  }
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}" crossorigin="anonymous"></script>`;
}

export function sanitizePublisherId(value: string) {
  const publisherId = extractPublisherId(value.trim());
  if (!publisherId) return "";
  if (!publisherId.startsWith("ca-pub-")) {
    throw new Error("Publisher ID must start with ca-pub-");
  }
  return publisherId;
}

export function parseMetaVerificationTag(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { tag: "", name: "", content: "" };

  const name = trimmed.match(/\sname=["']([^"']+)["']/i)?.[1] || "";
  const content = trimmed.match(/\scontent=["']([^"']+)["']/i)?.[1] || "";
  const safeName = name.replace(/[^\w:.-]/g, "");
  const safeContent = content.replace(/["<>]/g, "");

  if (!safeName || !safeContent) {
    throw new Error("Meta verification tag must include name and content attributes");
  }

  return {
    tag: `<meta name="${safeName}" content="${safeContent}" />`,
    name: safeName,
    content: safeContent
  };
}

export function sanitizeAdsTxt(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/[<>]/.test(line))
    .slice(0, 50)
    .join("\n");
}

export function mergeAdsenseSetup(current: AdsenseSetup, body: Partial<AdsenseSetup> & { action?: string }): AdsenseSetup {
  const scriptSnippet = body.scriptSnippet !== undefined ? sanitizeAdsenseScript(body.scriptSnippet) : current.scriptSnippet;
  const publisherId = sanitizePublisherId(body.publisherId || scriptSnippet || current.publisherId);
  const meta = body.metaVerificationTag !== undefined ? parseMetaVerificationTag(body.metaVerificationTag) : {
    tag: current.metaVerificationTag,
    name: current.metaName,
    content: current.metaContent
  };

  return {
    ...current,
    publisherId: publisherId || current.publisherId,
    scriptSnippet,
    adsTxtSnippet: body.adsTxtSnippet !== undefined ? sanitizeAdsTxt(body.adsTxtSnippet) : current.adsTxtSnippet,
    metaVerificationTag: meta.tag,
    metaName: meta.name,
    metaContent: meta.content,
    autoAdsEnabled: body.autoAdsEnabled ?? current.autoAdsEnabled,
    manualAdsEnabled: body.manualAdsEnabled ?? current.manualAdsEnabled,
    injectHeadScript: body.injectHeadScript ?? current.injectHeadScript,
    publishAdsTxt: body.publishAdsTxt ?? current.publishAdsTxt,
    injectMetaTag: body.injectMetaTag ?? current.injectMetaTag,
    status: body.status || current.status,
    updatedAt: new Date().toISOString()
  };
}

export function adsenseChecks(setup: AdsenseSetup) {
  return {
    scriptFound: Boolean(setup.injectHeadScript && setup.publisherId && setup.scriptSnippet.includes(ADSENSE_SCRIPT_HOST)),
    publisherIdFound: Boolean(setup.publisherId?.startsWith("ca-pub-")),
    adsTxtFound: Boolean(setup.publishAdsTxt && setup.adsTxtSnippet),
    metaTagFound: !setup.metaVerificationTag || Boolean(setup.injectMetaTag && setup.metaName && setup.metaContent)
  };
}
