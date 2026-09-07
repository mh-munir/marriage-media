import type { Metadata } from "next";
import "./globals.css";
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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}