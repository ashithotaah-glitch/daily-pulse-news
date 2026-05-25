import { NextRequest, NextResponse } from "next/server";
import { getAdapter } from "@/lib/news/adapters";
import { readAdminStore, timestamp, updateAdminStore } from "@/lib/admin/store";
import type { ManagedSource } from "@/lib/admin/types";

export async function GET() {
  const store = await readAdminStore();
  return NextResponse.json({ sources: store.sources });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const createdAt = timestamp();
  const source: ManagedSource = {
    id: body.id || `source-${Date.now()}`,
    name: body.name || "New Source",
    type: body.type || "generic-rss",
    url: body.url || "",
    category: body.category || "top",
    region: body.region || "global",
    language: body.language || "en",
    enabled: Boolean(body.enabled),
    credibilityScore: Number(body.credibilityScore || 65),
    lastFetchedAt: "",
    lastStatus: "unknown",
    lastError: "",
    createdAt,
    updatedAt: createdAt
  };
  const store = await updateAdminStore((current) => {
    current.sources = [source, ...current.sources.filter((item) => item.id !== source.id)];
  });
  return NextResponse.json({ source, sources: store.sources });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const store = await updateAdminStore((current) => {
    current.sources = current.sources.map((source) =>
      source.id === body.id ? { ...source, ...body, updatedAt: timestamp() } : source
    );
  });
  return NextResponse.json({ sources: store.sources });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const store = await updateAdminStore((current) => {
    current.sources = current.sources.filter((source) => source.id !== id);
  });
  return NextResponse.json({ sources: store.sources });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const store = await readAdminStore();
  const source = store.sources.find((item) => item.id === body.id);
  if (!source) return NextResponse.json({ error: "Source not found" }, { status: 404 });

  try {
    const articles = await getAdapter({
      id: source.id,
      name: source.name,
      adapter: source.type,
      homepage: source.url,
      url: source.url,
      category: source.category,
      region: source.region,
      language: source.language,
      credibility: source.credibilityScore / 100,
      enabled: source.enabled,
      limit: 3
    }).fetch({
      id: source.id,
      name: source.name,
      adapter: source.type,
      homepage: source.url,
      url: source.url,
      category: source.category,
      region: source.region,
      language: source.language,
      credibility: source.credibilityScore / 100,
      enabled: source.enabled,
      limit: 3
    });

    await updateAdminStore((current) => {
      current.sources = current.sources.map((item) =>
        item.id === source.id
          ? { ...item, lastFetchedAt: timestamp(), lastStatus: "ok", lastError: "", updatedAt: timestamp() }
          : item
      );
    });
    return NextResponse.json({ ok: true, count: articles.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch failed";
    await updateAdminStore((current) => {
      current.sources = current.sources.map((item) =>
        item.id === source.id
          ? { ...item, lastFetchedAt: timestamp(), lastStatus: "failed", lastError: message, updatedAt: timestamp() }
          : item
      );
    });
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
