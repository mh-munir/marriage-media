import type { Metadata } from "next";
import "./globals.css";
import { ThemeInit } from "@/components/theme-init";
import { MonetagScript } from "@/components/monetag-script";
import { Providers } from "@/providers/providers";
import { getPageMetadata } from "@/lib/page-seo";
import { VisitorTracker } from "@/components/visitor-tracker";

const monetagScriptUrl = process.env.NEXT_PUBLIC_MONETAG_SCRIPT_URL;

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageMetadata("home");
  return {
    ...metadata,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    icons: {
      icon: "/api/site-branding/favicon",
      shortcut: "/api/site-branding/favicon",
      apple: "/api/site-branding/favicon",
    },
  };
}

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
        <ThemeInit />
        <MonetagScript src={monetagScriptUrl} />
        <Providers>
          {children}
          <VisitorTracker />
        </Providers>
      </body>
    </html>
  );
}
