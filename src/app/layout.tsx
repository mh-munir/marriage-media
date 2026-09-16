import type { Metadata } from "next";
import "./globals.css";
import { ThemeInit } from "@/components/theme-init";
import { Providers } from "@/providers/providers";

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
        <ThemeInit />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
