"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, Heart, MapPin, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HomeDashboardAction } from "@/app/home-dashboard-action";
import type { HomeProfile } from "@/lib/home-data";

export interface HomeSection {
  id: string;
  type: "hero" | "values" | "community" | "steps" | "stories" | "final";
  visible: boolean;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  secondaryImageUrl?: string;
  secondaryImageAlt?: string;
  buttonText: string;
  buttonLink: string;
  items: Array<{ title: string; text: string; imageUrl?: string; imageAlt?: string }>;
}

const getFallbackProfileImage = (gender?: "Male" | "Female") =>
  gender === "Male" ? "/images/home/portrait-four.jpg" : "/images/home/portrait-one.jpg";

const defaultCommunityItems = [
  { title: "Aisha Khan", text: "Dhaka · 27", imageUrl: "/images/home/portrait-one.jpg", imageAlt: "Aisha Khan" },
  { title: "Rafi Ahmed", text: "Chattogram · 30", imageUrl: "/images/home/portrait-two.jpg", imageAlt: "Rafi Ahmed" },
  { title: "Nusrat Jahan", text: "Sylhet · 26", imageUrl: "/images/home/portrait-three.jpg", imageAlt: "Nusrat Jahan" },
  { title: "Arif Rahman", text: "Rajshahi · 29", imageUrl: "/images/home/portrait-four.jpg", imageAlt: "Arif Rahman" },
];

export function ensureHomeSections(sections: HomeSection[]) {
  return sections.map((section) => section.type === "community" && section.items.length === 0 ? { ...section, imageUrl: "", imageAlt: "", items: defaultCommunityItems } : section);
}

export function HomePageOverride({ sections }: { sections: HomeSection[] }) {
  const [memberProfiles, setMemberProfiles] = useState<HomeProfile[]>([]);

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

  return <div className="min-h-screen bg-[#fffdfc] text-[#263b3a]"><Header /><main>{ensureHomeSections(sections).filter((section) => section.visible).map((section) => section.type === "hero" ? <HeroSection key={section.id} section={section} /> : section.type === "community" ? <CommunitySection key={section.id} section={section} memberProfiles={memberProfiles} /> : <StandardSection key={section.id} section={section} />)}</main><Footer /></div>;
}

function HeroSection({ section }: { section: HomeSection }) {
  const secondaryImage = section.secondaryImageUrl || "/images/home/celebration.jpg";
  return <section className="relative bg-[#f7efee] px-5 pb-16 pt-28 sm:px-8 lg:pb-24 lg:pt-36"><div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#f7c9c3]/40 blur-3xl" /><div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-20"><div className="relative z-10 max-w-xl"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#efc5bf] bg-white/70 px-4 py-2 text-xs font-semibold text-[#b96862]"><Sparkles className="h-3.5 w-3.5" />{section.eyebrow}</div><h1 className="font-serif text-5xl leading-[.96] text-[#223c3a] sm:text-7xl">{section.title}</h1><p className="mt-7 max-w-lg text-base leading-7 text-[#6c817e]">{section.description}</p><div className="mt-9 flex flex-wrap items-center gap-4"><HomeDashboardAction /><Link href="/success-stories" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-[#486866]">See success stories <ArrowRight className="h-4 w-4" /></Link></div></div><div className="relative mx-auto h-115 w-full max-w-lg sm:h-140"><div className="absolute right-0 top-0 h-[88%] w-[78%] overflow-hidden rounded-[180px_180px_12px_12px] border-8 border-white bg-white shadow-2xl shadow-[#7b5d59]/15"><Image src={section.imageUrl || "/images/home/hero-couple.jpg"} alt={section.imageAlt || section.title} fill className="object-cover" sizes="100vw" /></div><div className="absolute bottom-0 left-0 h-48 w-44 overflow-hidden rounded-2xl border-8 border-[#f7efee] bg-white shadow-xl sm:h-56 sm:w-52"><Image src={secondaryImage} alt={section.secondaryImageAlt || "Wedding celebration"} fill className="object-cover" sizes="176px" /></div><div className="absolute bottom-10 right-0 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#486866] shadow-xl"><span className="h-5 w-5 rounded-full bg-[#61b69e]" />Verified profiles</div></div></div></section>;
}

function StandardSection({ section }: { section: HomeSection }) {
  const isValues = section.type === "values";
  const isSteps = section.type === "steps";

  return (
    <section className={`px-5 py-20 sm:px-8 lg:py-28 ${section.type === "community" || section.type === "final" ? "bg-[#eff8f7]" : ""}`}>
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
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#355350]">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </div>
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
              {section.imageUrl ? <Image src={section.imageUrl} alt={section.imageAlt || section.title} fill className="max-h-105 w-full rounded-4xl object-cover shadow-lg" sizes="100vw" /> : null}
            </div>
            {section.items.length ? (
              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {section.items.map((item, index) => (
                  <article key={`${section.id}-${index}`} className="border-t-2 border-[#f1b3ac] px-1 pt-5">
                    {item.imageUrl ? <Image src={item.imageUrl} alt={item.imageAlt || item.title} fill className="mb-4 h-36 w-full rounded-2xl object-cover" sizes="100vw" /> : <Sparkles className="h-6 w-6 text-[#e8897f]" />}
                    <h3 className="mt-4 font-serif text-2xl text-[#355350]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#78908c]">{item.text}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

function CommunitySection({ section, memberProfiles }: { section: HomeSection; memberProfiles: HomeProfile[] }) {
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
    const cardWidth = firstCard?.offsetWidth ?? 240;
    const gap = 16;

    carousel.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#eff8f7] px-5 py-20 sm:px-8 lg:py-24">
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

        <div ref={carouselRef} className="scrollbar-none mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {cards.map((item, index) => (
            <Link
              href={item.profileLink || "/register"}
              key={`${section.id}-${index}`}
              data-carousel-card
              className="group block min-w-60 max-w-60 snap-start"
            >
              <div className="overflow-hidden rounded-[28px] border border-[#e9d6d1] bg-white shadow-[0_18px_35px_rgba(88,111,109,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_45px_rgba(88,111,109,0.16)]">
                <div className="relative">
                  <Image
                    src={item.imageUrl || (index % 2 === 0 ? "/images/home/portrait-one.jpg" : "/images/home/portrait-four.jpg")}
                    alt={item.imageAlt || item.title}
                    fill
                    className="aspect-4/5 w-full rounded-t-[28px] object-cover transition duration-500 group-hover:scale-105"
                    sizes="240px"
                  />
                  <div className="absolute inset-0 rounded-t-[28px] bg-linear-to-t from-[#1f3d3b]/45 via-[#1f3d3b]/10 to-transparent" />

                  <button
                    type="button"
                    aria-label={`Save ${item.title}`}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#e8897f] shadow-sm backdrop-blur-sm"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>

                  {item.isVerified ? (
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#dff8ee] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#235945] shadow-sm">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-[#355350]">{item.title}</p>
                      <p className="mt-1 text-sm text-[#6f8580]">{item.meta}</p>
                    </div>
                    {item.isPremium ? (
                      <span className="rounded-full bg-[#fef0ef] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#b96862]">
                        Paid
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#6f8580]">
                    <MapPin className="h-3.5 w-3.5 text-[#e8897f]" />
                    <span className="truncate">{item.text}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#f0d6d1] pt-3">
                    <div className="flex items-center gap-3 text-[11px] text-[#6f8580]">
                      <span className="inline-flex items-center gap-1">
                        <BadgeCheck className="h-3.5 w-3.5 text-[#61b69e]" />
                        {item.isVerified ? "Verified" : "New"}
                      </span>
                      <span>{item.isPremium ? "Premium" : "Community"}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#355350]">View profile →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function defaultHomeSections(): HomeSection[] {
  return [
    { id: "hero", type: "hero", visible: true, eyebrow: "Meaningful connections, made simpler", title: "Meet someone who feels like home.", description: "Marriage Media helps you find a genuine life partner through thoughtful matching, verified profiles, and conversations that matter.", imageUrl: "/images/home/hero-couple.jpg", imageAlt: "Couple walking together", secondaryImageUrl: "/images/home/celebration.jpg", secondaryImageAlt: "Wedding celebration", buttonText: "Find your match", buttonLink: "/register", items: [] },
    { id: "values", type: "values", visible: true, eyebrow: "A better way to meet", title: "Built for something real.", description: "No endless noise. Just a warm, trusted space for people who are ready for a meaningful relationship.", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [{ title: "Trust comes first", text: "Verification and privacy tools help you connect with confidence." }, { title: "Smarter recommendations", text: "Find people who align with your values, lifestyle, and future plans." }, { title: "Made for commitment", text: "A community for genuine conversations and lasting partnerships." }] },
    { id: "community", type: "community", visible: true, eyebrow: "Meet the community", title: "People worth getting to know.", description: "Every profile is a person with a story, a family, and hopes for the future. Start with a hello.", imageUrl: "", imageAlt: "", buttonText: "Join Marriage Media", buttonLink: "/register", items: defaultCommunityItems },
    { id: "steps", type: "steps", visible: true, eyebrow: "How it works", title: "Three steps to your next chapter.", description: "A thoughtful path from your first profile to a meaningful conversation.", imageUrl: "", imageAlt: "", buttonText: "", buttonLink: "", items: [{ title: "Tell us your story", text: "Share the values, dreams, and little details that make you, you." }, { title: "Discover your match", text: "Explore thoughtful recommendations shaped around what matters to you." }, { title: "Start something real", text: "Connect safely and take the next step at your own pace." }] },
    { id: "stories", type: "stories", visible: true, eyebrow: "Real stories, real hope", title: "The best love stories start with a conversation.", description: "Read stories from members who found a meaningful connection.", imageUrl: "/images/home/table.jpg", imageAlt: "Elegant wedding table", buttonText: "Read member stories", buttonLink: "/success-stories", items: [] },
    { id: "final", type: "final", visible: true, eyebrow: "Start today", title: "A thoughtful beginning can change everything.", description: "Join a growing community of people looking for a partner, not just another profile.", imageUrl: "/images/home/bride.jpg", imageAlt: "Wedding details", buttonText: "Find your match", buttonLink: "/register", items: [] },
  ];
}
