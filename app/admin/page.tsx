import type { Metadata } from "next";
import { AdminConsole } from "@/components/AdminConsole";

export const metadata: Metadata = {
  title: "FlashFeed Admin Console",
  description: "Manage SEO settings, AdSense placements, sponsorship inventory, and monetization tools."
};

export default function AdminPage() {
  return (
    <main className="admin-page">
      <AdminConsole />
    </main>
  );
}
