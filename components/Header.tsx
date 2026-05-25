import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span>FF</span>
        <strong>{siteConfig.name}</strong>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/#top">News</Link>
        <Link href="/#finance">Markets</Link>
        <Link href="/#world">World</Link>
      </nav>
    </header>
  );
}
