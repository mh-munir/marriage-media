export const SITE_CONFIG = {
  name: "Halal Biye Bangladesh",
  title: "Halal Biye Bangladesh | MetroMonitor",
  description:
    "Halal Biye Bangladesh by MetroMonitor is Bangladesh's trusted halal matrimony platform. Find your perfect life partner with verified profiles and meaningful matching.",
  shortDescription:
    "Bangladesh's trusted halal matrimony platform. Find your perfect life partner today.",
  url: "https://marriagemedia.com",
  ogImage: "https://marriagemedia.com/og-image.png",
  logo: "https://marriagemedia.com/logo.png",
  email: "support@marriagemedia.com",
  phone: "+880-1XXXXXXXXX",
  social: {
    facebook: "https://facebook.com/marriagemedia",
    twitter: "https://twitter.com/marriagemedia",
    instagram: "https://instagram.com/marriagemedia",
    linkedin: "https://linkedin.com/company/marriagemedia",
  },
  address: {
    street: "Dhanmondi",
    city: "Dhaka",
    region: "Dhaka",
    country: "BD",
    postalCode: "1205",
  },
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
    "AI matchmaking",
    "verified profiles",
  ],
} as const;

export const PUBLIC_ROUTES = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/success-stories", changeFrequency: "weekly", priority: 0.8 },
] as const;

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
}

export const PAGE_SEO: Record<string, PageMetadata> = {
  home: {
    title: "Halal Biye Bangladesh | MetroMonitor",
    description:
      "Halal Biye Bangladesh by MetroMonitor is Bangladesh's trusted halal matrimony platform. Find your perfect life partner with advanced AI matching, verified profiles, and secure communication.",
    keywords: [
      "matrimony bangladesh",
      "marriage partner bangladesh",
      "find bride groom",
      "AI matchmaking",
      "verified matrimony",
      "free registration",
    ],
  },
  about: {
    title: "About Us - Halal Biye Bangladesh",
    description:
      "Learn about Halal Biye Bangladesh by MetroMonitor, Bangladesh's trusted halal matrimony platform. Discover our mission to bring families together through thoughtful matching and verified profiles.",
    keywords: [
      "about marriage media",
      "matrimony platform bangladesh",
      "trusted matrimony",
      "our mission",
    ],
  },
  pricing: {
    title: "Pricing Plans - Halal Biye Bangladesh",
    description:
      "Choose from Free, Premium, and Gold plans at Halal Biye Bangladesh. Get access to profiles, AI matching, and priority support with affordable plans for every budget.",
    keywords: [
      "matrimony pricing",
      "marriage media plans",
      "premium matrimony",
      "affordable matchmaking",
    ],
  },
  contact: {
    title: "Contact Us - Halal Biye Bangladesh",
    description:
      "Get in touch with Halal Biye Bangladesh by MetroMonitor. Our support team is here to help with registrations, profiles, payments, and finding your perfect match.",
    keywords: [
      "contact marriage media",
      "matrimony support",
      "help center",
      "customer service",
    ],
  },
  blog: {
    title: "Blog - Halal Biye Bangladesh",
    description:
      "Read the latest articles on marriage, relationships, halal dating, and matrimony advice on the Halal Biye Bangladesh blog. Expert insights for your journey to finding love.",
    keywords: [
      "marriage blog",
      "relationship advice",
      "dating tips",
      "matrimony articles",
      "love advice",
    ],
  },
  successStories: {
    title: "Success Stories - Halal Biye Bangladesh",
    description:
      "Read inspiring love stories from couples who found their perfect match on Halal Biye Bangladesh. Real testimonials from happy families across Bangladesh.",
    keywords: [
      "success stories",
      "happy couples",
      "marriage testimonials",
      "love stories bangladesh",
    ],
  },
};
