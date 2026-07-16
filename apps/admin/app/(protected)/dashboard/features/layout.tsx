import type { Metadata } from "next";

import { FeaturesProvider } from "@/components/context/feature-context";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Manage platform features, permissions, and their availability status. Enable, disable, or mark features as coming soon.",
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FeaturesProvider>{children}</FeaturesProvider>;
}
