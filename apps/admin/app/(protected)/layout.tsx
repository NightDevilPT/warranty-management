import type { Metadata } from "next";
import { RootProvider } from "@/components/index";

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
