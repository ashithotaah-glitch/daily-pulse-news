import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "flashfeed_admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isPublicAdminPath = pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout";

  if ((!isAdminPage && !isAdminApi) || isPublicAdminPath) {
    return NextResponse.next();
  }

  const token = process.env.ADMIN_SESSION_TOKEN || process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSCODE || "";
  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;

  if (token && cookie === token) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
