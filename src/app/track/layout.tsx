import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Check the status of your Elite Car Mats order by number.",
  robots: { index: false, follow: false },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
