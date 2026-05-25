"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/sources", label: "Sources" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/ai", label: "AI" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/monetization", label: "Monetization" },
  { href: "/admin/monetization/adsense-setup", label: "AdSense Setup" },
  { href: "/admin/settings", label: "Settings" }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (isLogin) return <>{children}</>;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">
          <span>FF</span>
          <strong>Admin</strong>
        </Link>
        <nav aria-label="Admin navigation">
          {navItems.map((item) => (
            <Link className={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "active" : ""} href={item.href as never} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span>FlashFeed.blog</span>
            <strong>Operations console</strong>
          </div>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
