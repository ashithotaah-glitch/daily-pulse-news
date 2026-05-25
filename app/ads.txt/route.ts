import { readAdminStore } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await readAdminStore();
  const body = store.adsenseSetup.publishAdsTxt ? store.adsenseSetup.adsTxtSnippet : "";

  return new Response(body ? `${body}\n` : "", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}
