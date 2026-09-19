import type { Metadata } from "next";
import "./globals.css";
import { ThemeInit } from "@/components/theme-init";
import { MonetagScript } from "@/components/monetag-script";
import { Providers } from "@/providers/providers";

const monetagScriptUrl = process.env.NEXT_PUBLIC_MONETAG_SCRIPT_URL;

export const metadata: Metadata = {
  title: "Marriage Media",
  description: "Find your perfect partner.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" data-languages="bn,en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/api/site-branding/favicon" />
        <ThemeInit />
        <MonetagScript src={monetagScriptUrl} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
