"use client";

import * as React from "react";

export interface ManagedPageItem {
  title: string;
  titleBn?: string;
  titleEn?: string;
  text: string;
  textBn?: string;
  textEn?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface ManagedPageSection {
  id: string;
  visible: boolean;
  eyebrow: string;
  eyebrowBn?: string;
  eyebrowEn?: string;
  title: string;
  titleBn?: string;
  titleEn?: string;
  description: string;
  descriptionBn?: string;
  descriptionEn?: string;
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  buttonTextBn?: string;
  buttonTextEn?: string;
  buttonLink: string;
  items: ManagedPageItem[];
}

export function sectionValue(sections: ManagedPageSection[] | undefined, id: string, fallback: ManagedPageSection): ManagedPageSection {
  return sections?.find((section) => section.id === id) || fallback;
}

export function useManagedPage(slug: string) {
  const [sections, setSections] = React.useState<ManagedPageSection[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    let mounted = true;
    fetch(`/api/site-pages/${slug}`).then(async (response) => response.ok ? response.json() : { page: null }).then((data: { page?: { sections?: ManagedPageSection[] } | null }) => {
      if (mounted) setSections(data.page?.sections || []);
    }).catch(() => undefined).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [slug]);
  return { sections, loading };
}

export function itemValue(section: ManagedPageSection, index: number, fallback: ManagedPageItem): ManagedPageItem {
  return section.items[index] || fallback;
}

export function ensureManagedSections(slug: string, sections: ManagedPageSection[] | undefined): ManagedPageSection[] {
  const defaults = defaultManagedSections(slug);
  if (!sections?.length) return defaults;
  return defaults.map((fallback) => sections.find((section) => section.id === fallback.id) || fallback);
}

export function defaultManagedSections(slug: string): ManagedPageSection[] {
  if (slug === "about") return [
    { id: "hero", visible: true, eyebrow: "About Us", title: "Building Dreams of Happy Marriages", description: "Marriage Media was founded with a simple mission: to help people find their perfect life partner through technology, trust, and genuine care.", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [] },
    { id: "stats", visible: true, eyebrow: "", title: "", description: "", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [{ title: "Active Users", text: "50,000+" }, { title: "Successful Matches", text: "10,000+" }, { title: "Verified Profiles", text: "25,000+" }, { title: "Happy Families", text: "8,000+" }] },
    { id: "mission", visible: true, eyebrow: "Our Mission", title: "Our Mission", description: "To revolutionize the matchmaking experience in Bangladesh by combining traditional values with modern technology. We strive to create a safe, trusted platform where individuals and families can find compatible life partners with confidence and ease.", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [] },
    { id: "vision", visible: true, eyebrow: "Our Vision", title: "Our Vision", description: "To become Bangladesh's most trusted and loved matrimony platform, known for our commitment to genuine profiles, privacy, and helping millions of people find their happily ever after. We envision a world where every person finds their perfect match.", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [] },
    { id: "values", visible: true, eyebrow: "Our Values", title: "What We Stand For", description: "Our core values guide everything we do, from building features to serving our community.", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [{ title: "Trust & Safety", text: "Every profile is manually verified by our team to ensure authenticity and prevent fake accounts." }, { title: "Genuine Connections", text: "We focus on meaningful relationships that lead to lasting marriages, not casual encounters." }, { title: "Community First", text: "We build a supportive community where singles and families can find matches with confidence." }, { title: "Innovation", text: "Our AI-powered matching algorithm analyzes compatibility across 50+ data points for better matches." }] },
    { id: "team", visible: true, eyebrow: "Our Team", title: "Meet the People Behind Marriage Media", description: "A passionate team dedicated to helping you find your perfect match.", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [{ title: "Tanvir Ahmed", text: "Founder & CEO | Visionary leader with 10+ years in the matchmaking industry." }, { title: "Sabrina Rahman", text: "Head of Operations | Expert in building scalable platforms and exceptional user experiences." }, { title: "Imran Hossain", text: "Lead Engineer | Full-stack developer passionate about creating secure, reliable systems." }, { title: "Farhana Khan", text: "Community Manager | Dedicated to helping users find their perfect match." }] },
    { id: "recognition", visible: true, eyebrow: "", title: "Trusted by Thousands", description: "Marriage Media has been recognized as one of the leading matrimony platforms in Bangladesh. Our commitment to trust, safety, and genuine connections has earned us the loyalty of over 50,000 active users and thousands of happy marriages.", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [] },
  ];
  if (slug === "pricing") return [
    { id: "hero", visible: true, eyebrow: "Pricing", eyebrowBn: "মূল্য তালিকা", title: "Find Your Perfect Plan", titleBn: "আপনার জন্য সেরা প্ল্যান খুঁজুন", description: "Choose the plan that suits your journey to finding your life partner. Start free and upgrade when you're ready.", descriptionBn: "জীবনসঙ্গী খোঁজার যাত্রায় আপনার উপযুক্ত প্ল্যান বেছে নিন। বিনামূল্যে শুরু করুন এবং প্রস্তুত হলে আপগ্রেড করুন।", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [] },
    { id: "benefits", visible: true, eyebrow: "Why Upgrade?", eyebrowBn: "কেন আপগ্রেড করবেন?", title: "Unlock Premium Features", titleBn: "প্রিমিয়াম সুবিধা আনলক করুন", description: "Premium members find their match 3x faster. Here's what you get.", descriptionBn: "প্রিমিয়াম সদস্যরা তাদের সঙ্গী ৩ গুণ দ্রুত খুঁজে পান। আপনি কী পাবেন।", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [{ title: "Unlimited Chat", titleBn: "সীমাহীন চ্যাট", text: "Send and receive unlimited messages with your matches.", textBn: "আপনার ম্যাচদের সঙ্গে সীমাহীন বার্তা পাঠান ও গ্রহণ করুন।" }, { title: "AI Matching", titleBn: "এআই ম্যাচিং", text: "Get personalized match recommendations powered by AI.", textBn: "এআই-এর মাধ্যমে ব্যক্তিগতকৃত ম্যাচের পরামর্শ পান।" }, { title: "View Contact Info", titleBn: "যোগাযোগের তথ্য দেখুন", text: "Access phone numbers and email addresses of your matches.", textBn: "আপনার ম্যাচদের ফোন নম্বর ও ইমেইল ঠিকানা দেখুন।" }, { title: "Profile Boost", titleBn: "প্রোফাইল বুস্ট", text: "Get 10x more profile views with monthly profile boosts.", textBn: "মাসিক প্রোফাইল বুস্টে ১০ গুণ বেশি ভিউ পান।" }] },
    { id: "testimonials", visible: true, eyebrow: "Success Stories", eyebrowBn: "সফলতার গল্প", title: "What Our Premium Members Say", titleBn: "আমাদের প্রিমিয়াম সদস্যরা কী বলেন", description: "", descriptionBn: "", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [] },
    { id: "faq", visible: true, eyebrow: "", eyebrowBn: "", title: "Frequently Asked Questions", titleBn: "সাধারণ জিজ্ঞাসা", description: "", descriptionBn: "", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [] },
  ];
  return [
    { id: "hero", visible: true, eyebrow: "Success Stories", title: "Love Stories That Inspire", description: "Real couples who found their perfect match on Marriage Media. Their stories could be your story.", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [] },
    { id: "gallery", visible: true, eyebrow: "Success Stories", title: "Moments That Matter", description: "A glimpse at the couples and memories made through Marriage Media.", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [{ title: "", text: "", imageUrl: "/images/home/celebration.jpg", imageAlt: "A joyful wedding celebration" }, { title: "", text: "", imageUrl: "/images/home/couple.jpg", imageAlt: "A happy couple" }, { title: "", text: "", imageUrl: "/images/home/hero-couple.jpg", imageAlt: "A couple walking together" }] },
    { id: "cta", visible: true, eyebrow: "", title: "Your Love Story Starts Here", description: "Join thousands of happy couples who found their perfect match on Marriage Media. Start your journey today.", imageUrl: "", imageAlt: "", buttonText: "Create Free Account", buttonLink: "/register", items: [] },
  ];
}
