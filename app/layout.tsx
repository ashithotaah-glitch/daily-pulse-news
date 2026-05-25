import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { readAdminStore } from "@/lib/admin/store";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | Daily automated news`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    url: siteConfig.url
  },
  robots: {
    index: true,
    follow: true
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const store = await readAdminStore();
  const adsense = store.adsenseSetup;
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/api/search/ai?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        {adsense.injectMetaTag && adsense.metaName && adsense.metaContent ? (
          <meta name={adsense.metaName} content={adsense.metaContent} />
        ) : null}
      </head>
      <body>
        {adsense.injectHeadScript && adsense.publisherId ? (
          <Script
            id="flashfeed-adsense-setup"
            async
            strategy="beforeInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.publisherId}`}
            crossOrigin="anonymous"
          />
        ) : siteConfig.adsenseClientId !== "ca-pub-0000000000000000" ? (
          <Script
            id="flashfeed-adsense-env"
            async
            strategy="beforeInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseClientId}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <Script
          id="flashfeed-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, websiteSchema]) }}
        />
        <Header />
        {children}
      </body>
    </html>
  );
}
