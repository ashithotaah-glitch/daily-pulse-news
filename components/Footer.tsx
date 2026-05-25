import Link from "next/link";
import { siteConfig } from "@/lib/site";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/advertise", label: "Advertise" },
  { href: "/sponsored-content", label: "Sponsored Content" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" }
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="brand footer-brand" href="/">
          <span>FF</span>
          <strong>{siteConfig.name}</strong>
        </Link>
        <p>{siteConfig.tagline}</p>
      </div>
      <nav aria-label="Footer navigation">
        {footerLinks.map((link) => (
          <Link href={link.href as never} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <small>Source-linked news summaries for discovery. Original publishers retain ownership of their reporting.</small>
    </footer>
  );
}
