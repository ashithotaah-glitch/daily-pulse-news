import type { Metadata } from "next";
import { SavedStoriesClient } from "@/components/SavedStoriesClient";

export const metadata: Metadata = {
  title: "Saved Stories"
};

export default function SavedPage() {
  return <SavedStoriesClient />;
}
