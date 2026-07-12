import "@workspace/ui/globals.css";
import type { Metadata } from "next";
import { RootProvider } from "@/components/index";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeContextProvider } from "@workspace/ui/context/theme-context";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "wm: admin",
  description: "Warranty management system admin portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased w-full h-screen overflow-hidden`}
      >
        <ThemeContextProvider>{children}</ThemeContextProvider>
      </body>
    </html>
  );
}
