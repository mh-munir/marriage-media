import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Marriage Media - Find Your Perfect Life Partner",
    template: "%s | Marriage Media",
  },
  description:
    "Marriage Media is Bangladesh's most trusted matrimony platform. Find your perfect life partner with advanced matching, verified profiles, and AI-powered recommendations.",
  keywords: [
    "matrimony",
    "marriage",
    "bangladesh",
    "partner",
    "bride",
    "groom",
    "rishta",
    "biye",
    "dating",
    "relationship",
  ],
  authors: [{ name: "Marriage Media" }],
  creator: "Marriage Media",
  publisher: "Marriage Media",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://marriagemedia.com",
    siteName: "Marriage Media",
    title: "Marriage Media - Find Your Perfect Life Partner",
    description:
      "Bangladesh's most trusted matrimony platform. Find your perfect life partner today.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Marriage Media",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marriage Media - Find Your Perfect Life Partner",
    description:
      "Bangladesh's most trusted matrimony platform. Find your perfect life partner today.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://marriagemedia.com"),
  verification: {
    google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e11d48" },
    { media: "(prefers-color-scheme: dark)", color: "#f43f5e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="canonical" href="https://marriagemedia.com" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}