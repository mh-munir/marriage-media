"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { useSiteBranding } from "@/hooks/use-site-branding";

const footerLinks = {
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/success-stories", label: "Success Stories" },
    { href: "/careers", label: "Careers" },
  ],
  support: [
    { href: "/help", label: "Help Center" },
    { href: "/safety", label: "Safety Tips" },
    { href: "/report", label: "Report Abuse" },
    { href: "/faq", label: "FAQ" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/refund", label: "Refund Policy" },
    { href: "/cookie", label: "Cookie Policy" },
  ],
  premium: [
    { href: "/pricing", label: "Pricing" },
    { href: "/features", label: "Premium Features" },
    { href: "/success-stories", label: "Success Stories" },
  ],
};

export function Footer() {
  const { translateText: text } = useLanguage();
  const { footerLogoUrl } = useSiteBranding();
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              {footerLogoUrl ? (
                <Image src={footerLogoUrl} alt="Marriage Media" width={208} height={48} className="h-12 max-w-52 rounded-md object-contain object-left" unoptimized />
              ) : (
                <>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/25">
                    <Heart className="h-5 w-5 text-white" fill="white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">
                    Marriage<span className="text-primary">Media</span>
                  </span>
                </>
              )}
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {text("Bangladesh's most trusted matrimony platform. Find your perfect life partner with advanced matching and verified profiles.")}
            </p>
            <div className="space-y-2">
              <a href="mailto:support@marriagemedia.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                support@marriagemedia.com
              </a>
              <a href="tel:+8801700000000" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                +880 1700-000000
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {text("Dhaka, Bangladesh")}
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold mb-4">{text("Company")}</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {text(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold mb-4">{text("Support")}</h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {text(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-4">{text("Legal")}</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {text(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div>
            <h3 className="text-sm font-semibold mb-4">{text("Premium")}</h3>
            <ul className="space-y-2.5">
              {footerLinks.premium.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {text(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Cox&apos;s IT Solution. {text("All rights reserved.")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Cox&apos;s IT Solution</span>
            <span className="hidden h-1 w-1 rounded-full bg-primary sm:block" aria-hidden="true" />
            <span>Munir Hossain</span>
            <a
              href="tel:+8801811914794"
              className="inline-flex items-center gap-1.5 font-medium text-primary transition-colors hover:text-primary/80"
              aria-label="Call Munir Hossain at 01811914794"
            >
              <Phone className="h-3.5 w-3.5" />
              01811-914794
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
