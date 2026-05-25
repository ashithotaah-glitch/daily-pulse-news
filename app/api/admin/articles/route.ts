import { NextRequest, NextResponse } from "next/server";
import { readAdminStore, timestamp, updateAdminStore } from "@/lib/admin/store";
import { runNewsPipeline, sortArticles } from "@/lib/news";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() || "";
  const category = searchParams.get("category");
  const source = searchParams.get("source");
  const store = await readAdminStore();
  const result = await runNewsPipeline();
  const moderation = new Map(store.articleModeration.map((item) => [item.articleId, item]));
  const articles = sortArticles(result.articles, "latest")
    .filter((article) => (!query || article.title.toLowerCase().includes(query)))
    .filter((article) => (!category || article.category === category))
    .filter((article) => (!source || article.sourceName === source))
    .slice(0, 120)
    .map((article) => ({
      ...article,
      moderation: moderation.get(article.id) || {
        articleId: article.id,
        isHidden: false,
        isFeatured: false,
        isPinned: false,
        isLowQuality: false,
        moderationStatus: "approved",
        adminNotes: "",
        updatedAt: ""
      },
      cluster: result.clusters.find((cluster) => cluster.clusterId === article.clusterId)
    }));
  return NextResponse.json({ articles });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const store = await updateAdminStore((current) => {
    const existing = current.articleModeration.find((item) => item.articleId === body.articleId);
    const next = {
      articleId: body.articleId,
      isHidden: Boolean(body.isHidden),
      isFeatured: Boolean(body.isFeatured),
      isPinned: Boolean(body.isPinned),
      isLowQuality: Boolean(body.isLowQuality),
      moderationStatus: body.moderationStatus || "approved",
      adminNotes: body.adminNotes || "",
      updatedAt: timestamp()
    };
    current.articleModeration = existing
      ? current.articleModeration.map((item) => (item.articleId === body.articleId ? next : item))
      : [next, ...current.articleModeration];
  });
  return NextResponse.json({ moderation: store.articleModeration });
}
