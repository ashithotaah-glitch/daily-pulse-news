export const siteConfig = {
  name: "Daily Pulse",
  tagline: "Real-time global news built for discovery and revenue.",
  description:
    "A monetization-ready news platform with automated daily news ingestion, category pages, SEO controls, AdSense slots, sponsorship inventory, and admin publishing tools.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  adsenseClientId: process.env.ADSENSE_CLIENT_ID || "ca-pub-0000000000000000"
};

export const revenueSlots = [
  { name: "Top leaderboard", format: "970x250 / responsive", placement: "Homepage header", yield: "High" },
  { name: "In-feed native", format: "Fluid", placement: "Between story cards", yield: "Medium" },
  { name: "Article rail", format: "300x600", placement: "Desktop right rail", yield: "High" },
  { name: "Sponsored briefing", format: "Newsletter + homepage", placement: "Morning package", yield: "Premium" }
];
