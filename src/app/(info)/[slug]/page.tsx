import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";

const pages = {
  careers: {
    title: "Careers",
    description: "Build safer, kinder ways for people to find meaningful relationships.",
    sections: ["We are growing a thoughtful team across product, engineering, trust and support. Send your introduction to support@marriagemedia.com to hear about future opportunities."],
  },
  help: {
    title: "Help Center",
    description: "Find help with your Halal Biye Bangladesh account.",
    sections: ["For registration, profile, safety or subscription support, contact support@marriagemedia.com. Please include the phone number on your account and a short description of the issue."],
  },
  safety: {
    title: "Safety Tips",
    description: "Take your time and protect your personal information.",
    sections: ["Keep conversations on the platform until you feel comfortable. Never share passwords, verification codes or financial details. Report suspicious behaviour and meet in a public place when meeting someone for the first time."],
  },
  report: {
    title: "Report Abuse",
    description: "Help us keep Halal Biye Bangladesh respectful and safe.",
    sections: ["Use the report controls on a profile or conversation, or email support@marriagemedia.com with the profile details and reason for your report. Do not send passwords or payment credentials."],
  },
  faq: {
    title: "Frequently Asked Questions",
    description: "Quick answers about using Halal Biye Bangladesh.",
    sections: ["You can create an account with your mobile number, complete your profile from Dashboard > Profile, and manage your subscription from Pricing. Contact support if a request fails unexpectedly."],
  },
  privacy: {
    title: "Privacy Policy",
    description: "How Halal Biye Bangladesh handles your information.",
    sections: ["We use account and profile information to provide matching, messaging, safety and support features. We limit access to authorised systems and do not ask for passwords by email. Contact support@marriagemedia.com for privacy questions."],
  },
  terms: {
    title: "Terms & Conditions",
    description: "The rules for using Halal Biye Bangladesh.",
    sections: ["Use accurate information, keep your account secure, and treat other members respectfully. Do not impersonate people, harass members, upload unlawful content or use the service for fraud. We may restrict accounts that violate these rules."],
  },
  refund: {
    title: "Refund Policy",
    description: "Information about subscription payments.",
    sections: ["Payment and refund requests are reviewed based on the plan, payment provider and applicable consumer law. Contact support@marriagemedia.com with your transaction reference before requesting a refund."],
  },
  cookie: {
    title: "Cookie Policy",
    description: "How cookies help the site work.",
    sections: ["Halal Biye Bangladesh uses essential cookies for authentication, security and preferences. Disabling essential cookies may prevent login and account features from working correctly."],
  },
  features: {
    title: "Premium Features",
    description: "Tools to help you get more from your search.",
    sections: ["Premium plans can provide enhanced discovery and communication features. Available features, prices and limits are shown on the Pricing page before purchase."],
  },
} as const;

type PageSlug = keyof typeof pages;

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug as PageSlug];
  return page ? { title: page.title, description: page.description } : {};
}

export default async function InformationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as PageSlug];
  if (!page) notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-pink-600">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Halal Biye Bangladesh</p>
              <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
            </div>
          </div>
          <p className="mb-8 text-lg text-muted-foreground">{page.description}</p>
          <div className="space-y-5 text-sm leading-7 text-foreground/80">
            {page.sections.map((section) => <p key={section}>{section}</p>)}
          </div>
        </div>
      </article>
    </main>
  );
}
