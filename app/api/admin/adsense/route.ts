import { NextRequest, NextResponse } from "next/server";
import { adsenseChecks, mergeAdsenseSetup } from "@/lib/admin/adsense";
import { readAdminStore, updateAdminStore } from "@/lib/admin/store";

export async function GET() {
  const store = await readAdminStore();
  return NextResponse.json({
    setup: store.adsenseSetup,
    checks: adsenseChecks(store.adsenseSetup)
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  try {
    const store = await updateAdminStore((current) => {
      const setup = mergeAdsenseSetup(current.adsenseSetup, body);
      if (body.action === "inject") {
        setup.injectHeadScript = true;
        setup.injectMetaTag = Boolean(setup.metaVerificationTag);
        setup.status = "code_added";
      }
      if (body.action === "publish-ads-txt") {
        setup.publishAdsTxt = true;
        setup.status = setup.injectHeadScript ? "code_added" : setup.status;
      }
      if (body.action === "verified") {
        setup.status = "verified";
      }
      if (body.action === "review-requested") {
        setup.status = "review_requested";
      }
      current.adsenseSetup = setup;
    });

    return NextResponse.json({
      setup: store.adsenseSetup,
      checks: adsenseChecks(store.adsenseSetup)
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid AdSense setup" }, { status: 400 });
  }
}
