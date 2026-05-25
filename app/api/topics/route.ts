import { NextResponse } from "next/server";
import { runNewsPipeline } from "@/lib/news";

export const revalidate = 600;

export async function GET() {
  const result = await runNewsPipeline();

  return NextResponse.json({
    updatedAt: result.fetchedAt,
    count: result.topics.length,
    topics: result.topics
  });
}
