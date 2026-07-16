import type { Metadata } from "next";
import { RootProvider } from "@/components/index";

export const metadata: Metadata = {
  title: {
    default: "WMS Admin",
    template: "%s | WMS Admin",
  },
  description:
    "Warranty Management System - Admin Portal. Manage organizations, features, brands, categories, and dealer types.",
  keywords: [
    "warranty",
    "management",
    "admin",
    "organizations",
    "features",
    "brands",
    "categories",
  ],
  authors: [{ name: "WMS Team" }],
  creator: "Warranty Management System",
  applicationName: "WMS Admin Portal",
  generator: "Next.js",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "WMS Admin",
    title: "WMS Admin Portal",
    description:
      "Warranty Management System - Admin Portal. Manage organizations, features, brands, categories, and dealer types.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WMS Admin Portal",
    description:
      "Warranty Management System - Admin Portal. Manage organizations, features, brands, categories, and dealer types.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootProvider>{children}</RootProvider>;
}
