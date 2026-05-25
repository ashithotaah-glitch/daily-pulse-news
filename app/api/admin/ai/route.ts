import { NextRequest, NextResponse } from "next/server";
import { readAdminStore, updateAdminStore } from "@/lib/admin/store";

export async function GET() {
  const store = await readAdminStore();
  return NextResponse.json({ settings: store.aiSettings });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const store = await updateAdminStore((current) => {
    current.aiSettings = { ...current.aiSettings, ...body };
  });
  return NextResponse.json({ settings: store.aiSettings });
}

export async function POST() {
  const store = await updateAdminStore((current) => {
    current.aiSettings.failedJobs = 0;
  });
  return NextResponse.json({ settings: store.aiSettings, retried: true });
}
