import type { Metadata } from "next";
import { RootProvider } from "@/components/index";
import { Geist, Geist_Mono } from "next/font/google";

export const metadata: Metadata = {
  title: "wm: admin",
  description: "Warranty management system admin portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootProvider>{children}</RootProvider>;
}
