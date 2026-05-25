import { NextResponse } from "next/server";
import { getNews } from "@/lib/news";

export const revalidate = 1800;

export async function GET() {
  const news = await getNews();

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    count: news.length,
    news
  });
}
