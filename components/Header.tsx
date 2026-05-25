import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="site-header">
      <div className="header-topline">
        <Link className="brand" href="/">
          <span>FF</span>
          <strong>{siteConfig.name}</strong>
        </Link>
        <div className="reader-actions">
          <Link href="/saved">Saved</Link>
          <Link href="/newsletter">Newsletter</Link>
          <Link href="/advertise">Advertise</Link>
          <Link href="/contact">Contact</Link>
          <Link className="support-link" href="/#membership">
            Subscribe
          </Link>
        </div>
      </div>
      <nav aria-label="Primary navigation" className="primary-nav">
        <Link href="/#top">Home</Link>
        <Link href="/#world">World</Link>
        <Link href="/#geopolitics">Geo-Politics</Link>
        <Link href="/#finance">Finance</Link>
        <Link href="/#technology">Tech</Link>
        <Link href="/#entertainment">Culture</Link>
        <Link href="/#sports">Sports</Link>
        <Link href="/#health">Health</Link>
        <Link href="/about">About</Link>
      </nav>
    </header>
  );
}
