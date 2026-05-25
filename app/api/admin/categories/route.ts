import { NextRequest, NextResponse } from "next/server";
import { readAdminStore, timestamp, updateAdminStore } from "@/lib/admin/store";
import type { ManagedCategory } from "@/lib/admin/types";

export async function GET() {
  const store = await readAdminStore();
  return NextResponse.json({ categories: store.categories.sort((a, b) => a.sortOrder - b.sortOrder) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const category: ManagedCategory = {
    id: body.id || body.slug || `category-${Date.now()}`,
    name: body.name || "New Category",
    slug: body.slug || String(body.name || "new-category").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: body.description || "",
    enabled: body.enabled ?? true,
    homepageVisible: body.homepageVisible ?? true,
    sortOrder: Number(body.sortOrder || 99),
    seoTitle: body.seoTitle || "",
    seoDescription: body.seoDescription || ""
  };
  const store = await updateAdminStore((current) => {
    current.categories = [category, ...current.categories.filter((item) => item.id !== category.id)];
  });
  return NextResponse.json({ category, categories: store.categories });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const store = await updateAdminStore((current) => {
    current.categories = current.categories.map((category) => (category.id === body.id ? { ...category, ...body } : category));
  });
  return NextResponse.json({ categories: store.categories });
}

export async function DELETE(request: NextRequest) {
  const id = new URL(request.url).searchParams.get("id");
  const store = await updateAdminStore((current) => {
    current.categories = current.categories.filter((category) => category.id !== id);
  });
  return NextResponse.json({ categories: store.categories, updatedAt: timestamp() });
}
