import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "wm: admin",
  description: "Warranty management system admin portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
