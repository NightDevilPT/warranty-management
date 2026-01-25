import { Metadata } from "next";
import "@workspace/ui/globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { RootProvider } from "@/components/providers";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "wm: consumer",
  description: "Warranty management system company portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
