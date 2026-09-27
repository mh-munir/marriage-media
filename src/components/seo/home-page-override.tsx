"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, Heart, MapPin, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HomeDashboardAction } from "@/app/home-dashboard-action";
import type { HomeProfile } from "@/lib/home-data";
import { localizedField } from "@/lib/localized-content";
import { useLanguage } from "@/providers/language-provider";

export interface HomeSection {
  id: string;
  type: "hero" | "values" | "community" | "steps" | "stories" | "final";
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
  secondaryImageUrl?: string;
  secondaryImageAlt?: string;
  buttonText: string;
  buttonTextBn?: string;
  buttonTextEn?: string;
  buttonLink: string;
  items: Array<{ title: string; titleBn?: string; titleEn?: string; text: string; textBn?: string; textEn?: string; imageUrl?: string; imageAlt?: string }>;
}

const getFallbackProfileImage = (gender?: "Male" | "Female") =>
  gender === "Male" ? "/images/home/portrait-four.jpg" : "/images/home/portrait-one.jpg";

export function ensureHomeSections(sections: HomeSection[]) {
  return sections.map((section) => section.type === "community" && section.items.length === 0 ? { ...section, imageUrl: "", imageAlt: "", items: [] } : section);
}

const sectionReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      delay,
    },
  }),
};

export function HomePageOverride({ sections }: { sections: HomeSection[] }) {
  const { language } = useLanguage();
  const [memberProfiles, setMemberProfiles] = useState<HomeProfile[]>([]);
  const localizedSections = ensureHomeSections(sections).map((section) => ({
    ...section,
    eyebrow: localizedField(section as unknown as Record<string, unknown>, "eyebrow", language, section.eyebrow),
    title: localizedField(section as unknown as Record<string, unknown>, "title", language, section.title),
    description: localizedField(section as unknown as Record<string, unknown>, "description", language, section.description),
    buttonText: localizedField(section as unknown as Record<string, unknown>, "buttonText", language, section.buttonText),
    items: section.items.map((item) => ({
      ...item,
      title: localizedField(item as unknown as Record<string, unknown>, "title", language, item.title),
      text: localizedField(item as unknown as Record<string, unknown>, "text", language, item.text),
    })),
  }));

  useEffect(() => {
    let active = true;

    const loadProfiles = async () => {
      try {
        const response = await fetch("/api/home", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          premiumMembers?: HomeProfile[];
        };

        if (!active) {
          return;
        }

        setMemberProfiles(data.premiumMembers ?? []);
      } catch {
        // Ignore fetch errors and keep the static CMS fallback content.
      }
    };

    void loadProfiles();

    return () => {
      active = false;
    };
  }, []);

  return <div className="home-page min-h-screen bg-[#fffdfc] text-[#263b3a]"><Header /><main>{localizedSections.filter((section) => section.visible).map((section, index) => section.type === "hero" ? <HeroSection key={section.id} section={section} index={index} /> : section.type === "community" ? <CommunitySection key={section.id} section={section} memberProfiles={memberProfiles} index={index} /> : <StandardSection key={section.id} section={section} index={index} />)}</main><Footer /></div>;
}

function HeroSection({ section, index }: { section: HomeSection; index: number }) {
  const secondaryImage = section.secondaryImageUrl || "/images/home/celebration.jpg";
  return <motion.section initial="hidden" animate="visible" variants={sectionReveal} custom={index * 0.12} className="relative bg-[#f7efee] px-5 pb-16 pt-28 sm:px-8 lg:pb-24 lg:pt-36"><div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#f7c9c3]/40 blur-3xl" /><div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-20"><motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.1 }} className="relative z-10 max-w-xl"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#efc5bf] bg-white/70 px-4 py-2 text-xs font-semibold text-[#b96862]"><Sparkles className="h-3.5 w-3.5" />{section.eyebrow}</div><h1 className="font-serif text-5xl leading-[.96] text-[#223c3a] sm:text-7xl">{section.title}</h1><p className="mt-7 max-w-lg text-base leading-7 text-[#6c817e]">{section.description}</p><div className="mt-9 flex flex-wrap items-center gap-4"><HomeDashboardAction /><Link href="/success-stories" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-[#486866]">See success stories <ArrowRight className="h-4 w-4" /></Link></div></motion.div><motion.div initial={{ opacity: 0, x: 18, scale: 0.98 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 1, delay: 0.18 }} className="relative mx-auto h-115 w-full max-w-lg sm:h-140"><div className="absolute right-0 top-0 h-[88%] w-[78%] overflow-hidden rounded-[180px_180px_12px_12px] border-8 border-white bg-white shadow-2xl shadow-[#7b5d59]/15"><Image src={section.imageUrl || "/images/home/hero-couple.jpg"} alt={section.imageAlt || section.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority loading="eager" /></div><div className="absolute bottom-0 left-0 h-48 w-44 overflow-hidden rounded-2xl border-8 border-[#f7efee] bg-white shadow-xl sm:h-56 sm:w-52"><Image src={secondaryImage} alt={section.secondaryImageAlt || "Wedding celebration"} fill className="object-cover" sizes="176px" /></div><div className="absolute bottom-10 right-0 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#486866] shadow-xl"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6d6fc5] text-white"><BadgeCheck className="h-3.5 w-3.5" /></span>Verified profiles</div></motion.div></div></motion.section>;
}

function StandardSection({ section, index }: { section: HomeSection; index: number }) {
  const isValues = section.type === "values";
  const isSteps = section.type === "steps";

  if (section.type === "final") {
    return (
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionReveal}
        custom={index * 0.12}
        className="home-final-cta relative isolate overflow-hidden bg-[#173f3c] px-5 py-20 sm:px-8 lg:py-28"
      >
        {section.imageUrl ? (
          <Image
            src={section.imageUrl}
            alt={section.imageAlt || ""}
            fill
            sizes="100vw"
            className="-z-20 object-cover object-center"
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#f8f4ed]/97 via-[#f8f4ed]/88 to-[#173f3c]/42" />
        <div className="absolute inset-0 -z-10 bg-[#173f3c]/12" />
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl rounded-[30px] border border-white/55 bg-white/18 p-7 shadow-[0_24px_60px_rgba(18,49,46,.18)] backdrop-blur-[2px] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#b96862]">{section.eyebrow}</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#263b3a] sm:text-5xl">{section.title}</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#466a66]">{section.description}</p>
            {section.buttonText ? (
              <Link
                href={section.buttonLink || "/register"}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#294845] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#294845]/20 transition hover:-translate-y-0.5 hover:bg-[#1e3a37]"
              >
                {section.buttonText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionReveal} custom={index * 0.12} className={`px-5 py-20 sm:px-8 lg:py-28 ${section.type === "community" ? "bg-[#eff8f7]" : ""}`}>
      <div className="mx-auto max-w-6xl">
        {isValues ? (
          <>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e8897f]">{section.eyebrow}</p>
                <h2 className="mt-3 font-serif text-4xl leading-tight text-[#263b3a] sm:text-5xl">{section.title}</h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-[#78908c]">{section.description}</p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {section.items.map((item, index) => (
                <article key={`${section.id}-${index}`} className="rounded-[28px] border border-[#f0d4ce] bg-white p-6 shadow-[0_18px_35px_rgba(88,111,109,0.06)]">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#fef0ef] text-[#e8897f]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl text-[#355350]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#78908c]">{item.text}</p>
                </article>
              ))}
            </div>
          </>
        ) : isSteps ? (
          <>
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e8897f]">{section.eyebrow}</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-[#263b3a] sm:text-5xl">{section.title}</h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {section.items.map((item, index) => (
                <article key={`${section.id}-${index}`} className="rounded-[28px] border border-[#f0d4ce] bg-[#fffdfd] p-6 shadow-[0_18px_35px_rgba(88,111,109,0.04)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-serif text-5xl text-[#f1d2ce]">{String(index + 1).padStart(2, "0")}</span>
                    {index < section.items.length - 1 ? <ArrowRight className="h-5 w-5 text-[#d9a8a0]" /> : null}
                  </div>
                  <div className="mt-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#fef0ef] text-[#e8897f]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-serif text-2xl text-[#355350]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#78908c]">{item.text}</p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={`grid items-center gap-10 ${section.imageUrl ? "lg:grid-cols-2" : "max-w-4xl"}`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e8897f]">{section.eyebrow}</p>
                <h2 className="mt-3 font-serif text-4xl leading-tight text-[#263b3a] sm:text-5xl">{section.title}</h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-[#78908c]">{section.description}</p>
                {section.buttonText ? <Link href={section.buttonLink || "/register"} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#294845] px-5 py-3 text-sm font-semibold text-white">{section.buttonText}<ArrowRight className="h-4 w-4" /></Link> : null}
              </div>
              {section.imageUrl ? <div className="relative h-80 overflow-hidden rounded-4xl shadow-lg sm:h-105"><Image src={section.imageUrl} alt={section.imageAlt || section.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div> : null}
            </div>
            {section.items.length ? (
              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {section.items.map((item, index) => (
                  <article key={`${section.id}-${index}`} className="border-t-2 border-[#f1b3ac] px-1 pt-5">
                    {item.imageUrl ? <div className="relative mb-4 h-36 overflow-hidden rounded-2xl"><Image src={item.imageUrl} alt={item.imageAlt || item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" /></div> : <Sparkles className="h-6 w-6 text-[#e8897f]" />}
                    <h3 className="mt-4 font-serif text-2xl text-[#355350]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#78908c]">{item.text}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </motion.section>
  );
}

function CommunitySection({ section, memberProfiles, index }: { section: HomeSection; memberProfiles: HomeProfile[]; index: number }) {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const cards = memberProfiles.length
    ? memberProfiles.slice(0, 4).map((member) => ({
        title: member.name,
        text: member.location,
        imageUrl: member.imageUrl || getFallbackProfileImage(member.gender),
        imageAlt: member.name,
        meta: `${member.age ? `${member.age} yrs` : "Age not added"} · ${member.profession || "Profession not added"}`,
        isPremium: member.isPremium,
        isVerified: member.isVerified,
        profileLink: `/dashboard/profile/${member.id}`,
      }))
    : section.items.slice(0, 4).map((item, index) => ({
        ...item,
        meta: item.text,
        isPremium: false,
        isVerified: index % 2 === 0,
        profileLink: "/register",
      }));

  const scrollCarousel = (direction: number) => {
    const carousel = carouselRef.current;
    if (!carousel) {
      return;
    }

    const firstCard = carousel.querySelector<HTMLElement>("[data-carousel-card]");
    const cardWidth = firstCard?.offsetWidth ?? 288;
    const gap = 16;

    carousel.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  };

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionReveal} custom={index * 0.12} className="bg-[#eff8f7] px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e8897f]">{section.eyebrow}</p>
              <h2 className="mt-3 font-serif text-4xl text-[#263b3a] sm:text-5xl">{section.title}</h2>
            </div>

            {section.buttonText ? (
              <Link href={section.buttonLink || "/register"} className="inline-flex items-center gap-2 rounded-xl border border-[#9fcfc7] bg-white px-5 py-3 text-sm font-semibold text-[#486866] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                {section.buttonText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>

          <p className="max-w-2xl text-sm leading-6 text-[#78908c]">{section.description}</p>
        </div>

        <div className="mb-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#bdd9d5] bg-white text-[#355350] transition hover:border-[#92b9b2] hover:bg-[#f8faf9]"
            aria-label="Previous members"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#bdd9d5] bg-white text-[#355350] transition hover:border-[#92b9b2] hover:bg-[#f8faf9]"
            aria-label="Next members"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.7 }} className="mt-8 rounded-3xl border border-dashed border-[#d9e7e4] bg-white/60 px-6 py-8 text-center text-sm text-[#6f8580]">
          No public member profiles to display.
        </motion.div>
      </div>
    </motion.section>
  );
}

export function defaultHomeSections(): HomeSection[] {
  return [
    { id: "hero", type: "hero", visible: true, eyebrow: "Meaningful connections, made simpler", title: "Meet someone who feels like home.", description: "Halal Biye Bangladesh helps you find a genuine life partner through thoughtful matching, verified profiles, and conversations that matter.", imageUrl: "/images/home/hero-couple.jpg", imageAlt: "Couple walking together", secondaryImageUrl: "/images/home/celebration.jpg", secondaryImageAlt: "Wedding celebration", buttonText: "Find your match", buttonLink: "/register", items: [] },
    { id: "values", type: "values", visible: true, eyebrow: "A better way to meet", title: "Built for something real.", description: "No endless noise. Just a warm, trusted space for people who are ready for a meaningful relationship.", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [{ title: "Trust comes first", text: "Verification and privacy tools help you connect with confidence." }, { title: "Smarter recommendations", text: "Find people who align with your values, lifestyle, and future plans." }, { title: "Made for commitment", text: "A community for genuine conversations and lasting partnerships." }] },
    { id: "community", type: "community", visible: true, eyebrow: "Meet the community", title: "People worth getting to know.", description: "Every profile is a person with a story, a family, and hopes for the future. Start with a hello.", imageUrl: "", imageAlt: "", buttonText: "Join Halal Biye Bangladesh", buttonLink: "/register", items: [] },
    { id: "steps", type: "steps", visible: true, eyebrow: "How it works", title: "Three steps to your next chapter.", description: "A thoughtful path from your first profile to a meaningful conversation.", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [{ title: "Tell us your story", text: "Share the values, dreams, and little details that make you, you." }, { title: "Discover your match", text: "Explore thoughtful recommendations shaped around what matters to you." }, { title: "Start something real", text: "Connect safely and take the next step at your own pace." }] },
    { id: "stories", type: "stories", visible: true, eyebrow: "Real stories, real hope", title: "The best love stories start with a conversation.", description: "Read stories from members who found a meaningful connection.", imageUrl: "/images/home/table.jpg", imageAlt: "Elegant wedding table", buttonText: "Read member stories", buttonLink: "/success-stories", items: [] },
    { id: "final", type: "final", visible: true, eyebrow: "Start today", title: "A thoughtful beginning can change everything.", description: "Join a growing community of people looking for a partner, not just another profile.", imageUrl: "/images/home/bride.jpg", imageAlt: "Wedding details", buttonText: "Find your match", buttonLink: "/register", items: [] },
  ];
}
