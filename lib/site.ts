export const siteConfig = {
  name: "FlashFeed",
  tagline: "Fast global news across markets, technology, culture, and world affairs.",
  description:
    "FlashFeed is an automated daily news platform covering technology, entertainment, geopolitics, finance, business, health, science, sports, and world news.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://flashfeed.blog",
  adsenseClientId: process.env.ADSENSE_CLIENT_ID || "ca-pub-0000000000000000"
};

export const revenueSlots = [
  { name: "Top leaderboard", format: "970x250 / responsive", placement: "Homepage header", yield: "High" },
  { name: "In-feed native", format: "Fluid", placement: "Between story cards", yield: "Medium" },
  { name: "Article rail", format: "300x600", placement: "Desktop right rail", yield: "High" },
  { name: "Sponsored briefing", format: "Newsletter + homepage", placement: "Morning package", yield: "Premium" }
];
