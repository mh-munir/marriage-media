"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, ChevronDown, ChevronLeft, ChevronRight, Heart, MapPin, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HomeDashboardAction } from "@/app/home-dashboard-action";
import type { HomeProfile } from "@/lib/home-data";
import { localizedField } from "@/lib/localized-content";
import { useLanguage } from "@/providers/language-provider";

export interface HomeSection {
  id: string;
  type: "hero" | "values" | "community" | "steps" | "stories" | "final" | "faq";
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
  return defaultHomeSections().map((fallback) => {
    const section = sections.find((item) => item.id === fallback.id) || fallback;
    return section.type === "community" && section.items.length === 0
      ? { ...section, imageUrl: "", imageAlt: "", items: [] }
      : section;
  });
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
  const { language, translateText } = useLanguage();
  const [memberProfiles, setMemberProfiles] = useState<HomeProfile[]>([]);
  const localizedSections = ensureHomeSections(sections).map((section) => ({
    ...section,
    eyebrow: localizedField(section as unknown as Record<string, unknown>, "eyebrow", language, section.eyebrow),
    title: localizedField(section as unknown as Record<string, unknown>, "title", language, section.title),
    description: localizedField(section as unknown as Record<string, unknown>, "description", language, section.description),
    buttonText: translateText(localizedField(section as unknown as Record<string, unknown>, "buttonText", language, section.buttonText)),
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

  return <div className="home-page min-h-screen bg-[#fffdfc] text-[#263b3a] transition-colors duration-300 dark:bg-[#0b1720] dark:text-[#edf6f4]"><Header /><main>{localizedSections.filter((section) => section.visible).map((section, index) => section.type === "hero" ? <HeroSection key={section.id} section={section} index={index} /> : section.type === "community" ? <CommunitySection key={section.id} section={section} memberProfiles={memberProfiles} index={index} /> : <StandardSection key={section.id} section={section} index={index} />)}</main><Footer /></div>;
}

function HeroSection({ section, index }: { section: HomeSection; index: number }) {
  const { t } = useLanguage();
  const secondaryImage = section.secondaryImageUrl || "/images/home/celebration.jpg";

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={sectionReveal}
      custom={index * 0.12}
      className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(247,201,195,0.38),transparent_30%),linear-gradient(135deg,#f7efee_0%,#f5f3ef_40%,#edf5f4_100%)] px-5 pb-16 pt-28 sm:px-8 lg:pb-24 lg:pt-36 dark:bg-[radial-gradient(circle_at_top_left,rgba(62,98,110,0.28),transparent_26%),linear-gradient(135deg,#0b1720_0%,#101d28_40%,#111827_100%)]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_38%,rgba(255,255,255,0.12))] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent_38%,rgba(148,163,184,0.06))]" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#f7c9c3]/40 blur-3xl dark:bg-[#1f4d5c]/45" />
      <div className="absolute right-0 top-0 h-full w-full bg-[radial-gradient(circle_at_bottom_right,rgba(164,202,196,0.15),transparent_30%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="relative z-10 max-w-xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#efc5bf] bg-white/80 px-4 py-2 text-xs font-semibold text-[#b96862] shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/55 dark:text-[#f7b5a8]">
            <Sparkles className="h-3.5 w-3.5" />
            {section.eyebrow}
          </div>

          <h1 className="font-serif text-5xl leading-[.96] text-[#223c3a] sm:text-7xl dark:text-[#f3f7f5]">
            {section.title}
          </h1>

          <p className="mt-7 max-w-lg text-base leading-7 text-[#6c817e] dark:text-[#d3e1de]">
            {section.description}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <HomeDashboardAction />
            <Link
              href="/success-stories"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d9dfe0] bg-white/80 px-4 py-3 text-sm font-semibold text-[#486866] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/60 dark:text-[#e7f0ef]"
            >
              {t("seeSuccessStories")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 18, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.18 }}
          className="relative mx-auto h-105 w-full max-w-130 sm:h-125"
        >
          <div className="absolute right-0 top-0 h-[88%] w-[78%] overflow-hidden rounded-[180px_180px_24px_24px] border-8 border-white/80 bg-white/70 shadow-[0_30px_80px_rgba(68,86,84,0.18)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-[0_30px_80px_rgba(2,6,23,0.5)]">
            <Image
              src={section.imageUrl || "/images/home/hero-couple.jpg"}
              alt={section.imageAlt || section.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              preload={index === 0}
            />
          </div>

          <div className="absolute bottom-0 left-0 h-48 w-44 overflow-hidden rounded-[26px] border-8 border-[#f7efee]/90 bg-white/80 shadow-[0_18px_50px_rgba(68,86,84,0.14)] dark:border-slate-800 dark:bg-slate-900/80 sm:h-56 sm:w-52">
            <Image
              src={secondaryImage}
              alt={section.secondaryImageAlt || "Wedding celebration"}
              fill
              className="object-cover"
              sizes="176px"
            />
          </div>

          <div className="absolute bottom-10 right-0 flex items-center gap-2 rounded-2xl border border-[#edf4f3] bg-white/90 px-4 py-3 text-xs font-semibold text-[#486866] shadow-[0_16px_40px_rgba(72,104,102,0.14)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85 dark:text-[#eaf3f3]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ADD8E6] text-white shadow-sm dark:bg-[#7dd3fc]">
              <BadgeCheck className="h-3.5 w-3.5" />
            </span>
            Verified profiles
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
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
        className="home-final-cta relative isolate overflow-hidden bg-[#193f3c] px-5 py-20 sm:px-8 lg:py-28 dark:bg-slate-950"
      >
        {section.imageUrl ? (
          <Image
            src={section.imageUrl}
            alt={section.imageAlt || ""}
            fill
            sizes="100vw"
            className="-z-20 object-cover object-center"
            preload={index === 0}
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#fffaf5]/98 via-[#fffaf5]/88 to-[#173f3c]/38 dark:from-slate-950/96 dark:via-slate-950/82 dark:to-slate-950/42" />
        <div className="absolute -left-24 top-1/2 -z-10 h-72 w-72 -translate-y-1/2 rounded-full bg-rose-200/35 blur-3xl dark:bg-cyan-500/10" />
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl border-l-4 border-rose-400/80 pl-6 sm:pl-9">
            <p className="inline-flex rounded-full border border-rose-200 bg-white/65 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.18em] text-[#b96862] backdrop-blur-sm dark:border-rose-400/20 dark:bg-slate-900/60 dark:text-rose-200">{section.eyebrow}</p>
            <h2 className="mt-5 font-serif text-4xl leading-[1.06] text-[#193f3c] sm:text-6xl dark:text-slate-50">{section.title}</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#52736f] dark:text-slate-300">{section.description}</p>
            {section.buttonText ? (
              <Link
                href={section.buttonLink || "/register"}
                className="login-gradient-cta mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5"
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

  if (section.type === "faq") {
    return <FaqSection section={section} index={index} />;
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
                {section.buttonText ? <Link href={section.buttonLink || "/register"} className="login-gradient-cta mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">{section.buttonText}<ArrowRight className="h-4 w-4" /></Link> : null}
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

function FaqSection({ section, index }: { section: HomeSection; index: number }) {
  const [openIndex, setOpenIndex] = useState(0);

  return <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} variants={sectionReveal} custom={index * 0.12} className="bg-[#fffaf7] px-5 py-20 transition-colors sm:px-8 lg:py-28 dark:bg-slate-950">
    <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[.88fr_1.12fr] lg:gap-16">
      <div className="relative mx-auto w-full max-w-md"><div className="absolute -inset-5 rounded-[38px] bg-rose-200/45 blur-2xl dark:bg-cyan-500/10" /><div className="relative h-80 overflow-hidden rounded-4xl border border-white/80 bg-[#eaf0ee] shadow-[0_25px_55px_rgba(73,94,89,.16)] dark:border-slate-700 dark:bg-slate-900 sm:h-115">{section.imageUrl ? <Image src={section.imageUrl} alt={section.imageAlt || section.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 42vw" /> : <div className="flex h-full items-center justify-center bg-linear-to-br from-rose-100 to-teal-100 text-[#52736f] dark:from-slate-800 dark:to-slate-900 dark:text-slate-300"><Heart className="h-12 w-12" /></div>}<div className="absolute inset-0 bg-linear-to-t from-[#193f3c]/55 via-transparent to-transparent" /><div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/30 bg-slate-950/25 p-4 text-white backdrop-blur-sm"><p className="text-sm font-medium">{section.eyebrow}</p></div></div></div>
      <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#b96862] dark:text-rose-300">{section.eyebrow}</p><h2 className="mt-3 font-serif text-4xl leading-tight text-[#193f3c] sm:text-5xl dark:text-slate-50">{section.title}</h2>{section.description ? <p className="mt-4 max-w-2xl text-base leading-7 text-[#6a8581] dark:text-slate-300">{section.description}</p> : null}<div className="mt-8 space-y-3">{section.items.map((item, itemIndex) => { const isOpen = itemIndex === openIndex; return <article key={`${section.id}-${itemIndex}`} className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm transition dark:border-slate-700 dark:bg-slate-900"><button type="button" className="flex w-full items-center justify-between gap-5 px-5 py-4 text-left font-semibold text-[#264946] dark:text-slate-100" onClick={() => setOpenIndex(isOpen ? -1 : itemIndex)} aria-expanded={isOpen}><span>{item.title}</span><ChevronDown className={`h-5 w-5 shrink-0 text-rose-400 transition-transform ${isOpen ? "rotate-180" : ""}`} /></button>{isOpen ? <div className="border-t border-rose-100 px-5 py-4 text-sm leading-6 text-[#65817d] dark:border-slate-700 dark:text-slate-300">{item.text}</div> : null}</article>; })}</div></div>
    </div>
  </motion.section>;
}

function CommunitySection({ section, memberProfiles, index }: { section: HomeSection; memberProfiles: HomeProfile[]; index: number }) {
  const { translateText } = useLanguage();
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
              <Link href={section.buttonLink || "/register"} className="login-gradient-cta inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5">
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
          {translateText("No public member profiles to display.")}
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
    { id: "faq", type: "faq", visible: true, eyebrow: "Common questions", eyebrowBn: "সাধারণ প্রশ্ন", title: "Everything you need to know", titleBn: "আপনার প্রয়োজনীয় সব তথ্য", description: "Helpful answers before you begin your journey with Marriage Media.", descriptionBn: "Marriage Media-তে যাত্রা শুরু করার আগে প্রয়োজনীয় উত্তরগুলো জেনে নিন।", imageUrl: "/images/home/celebration.jpg", imageAlt: "A joyful wedding celebration", buttonText: "", buttonLink: "", items: [{ title: "How do I create a profile?", titleBn: "আমি কীভাবে প্রোফাইল তৈরি করব?", text: "Create a free account, add your details and complete your profile so that compatible members can discover you.", textBn: "বিনামূল্যে একটি অ্যাকাউন্ট খুলুন, আপনার তথ্য যোগ করুন এবং প্রোফাইল সম্পূর্ণ করুন—তাহলে উপযুক্ত সদস্যরা আপনাকে খুঁজে পাবেন।" }, { title: "Are profiles verified?", titleBn: "প্রোফাইলগুলো কি যাচাইকৃত?", text: "We provide verification tools and review processes to help keep the community safe and trustworthy.", textBn: "কমিউনিটিকে নিরাপদ ও বিশ্বাসযোগ্য রাখতে আমরা যাচাইয়ের ব্যবস্থা ও পর্যালোচনা প্রক্রিয়া চালু রেখেছি।" }, { title: "Can I use Marriage Media for free?", titleBn: "আমি কি Marriage Media বিনামূল্যে ব্যবহার করতে পারি?", text: "Yes. You can start with a free account and choose a premium plan later when you need more features.", textBn: "হ্যাঁ। আপনি বিনামূল্যের অ্যাকাউন্ট দিয়ে শুরু করতে পারেন এবং প্রয়োজন হলে পরে প্রিমিয়াম প্ল্যান নিতে পারেন।" }] },
  ];
}
