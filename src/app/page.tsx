"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircleHeart,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HomeDashboardAction } from "@/app/home-dashboard-action";
import { HomeHeroStats } from "@/app/home-hero-stats";
import { HomeSearchForm } from "@/components/search/home-search-form";
import { CommunityStats } from "@/components/home/community-stats";
import { useTheme } from "@/components/theme-provider";
import { SitePageOverride, useSitePage } from "@/components/seo/site-page-override";
import { useLanguage } from "@/providers/language-provider";
import { translateLocationLabel } from "@/lib/location-labels";
import { getProfilePlaceholderImage } from "@/lib/profile-placeholder";
import type { HomeData } from "@/lib/home-data";

const image = {
  couple: "/images/home/hero-couple.jpg",
  celebration: "/images/home/celebration.jpg",
  bride: "/images/home/bride.jpg",
  table: "/images/home/table.jpg",
  portraitOne: "/images/home/portrait-one.jpg",
  portraitTwo: "/images/home/portrait-two.jpg",
  portraitThree: "/images/home/portrait-three.jpg",
  portraitFour: "/images/home/portrait-four.jpg",
};

const fallbackHomeStats = {
  activeProfiles: 0,
  premiumMembers: 0,
};

export default function HomePage() {
  const { page, loading } = useSitePage("home");
  const { t, translateText, language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const [homeData, setHomeData] = useState<HomeData | null>(null);

  useEffect(() => {
    if (loading || page?.sections?.length || page?.content || page?.contentBn || page?.contentEn) {
      return;
    }

    let isMounted = true;

    async function loadHomeData() {
      try {
        const response = await fetch("/api/home", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Home API failed: ${response.status}`);
        }

        const data = (await response.json()) as HomeData;
        if (isMounted) {
          setHomeData(data);
        }
      } catch (error) {
        console.error("Unable to load homepage data from API.", error);
        if (isMounted) {
          setHomeData(null);
        }
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, [loading, page]);

  const formatLocationText = (value: string | null | undefined) => {
    const normalized = value?.trim();
    if (!normalized) return translateText("Location not added");
    return translateLocationLabel(normalized, language) || translateText(normalized) || normalized;
  };

  const formatMemberProfession = (value: string | null | undefined) => {
    const normalized = value?.trim();
    if (!normalized) return translateText("Profession not added");
    return translateText(normalized) || normalized;
  };

  const steps = [
    { icon: Search, number: "01", title: t("tellStory"), text: t("homeDescription") },
    { icon: Sparkles, number: "02", title: t("discoverMatch"), text: t("communityDescription") },
    { icon: MessageCircleHeart, number: "03", title: t("startSomethingReal"), text: t("noEndlessNoise") },
  ];

  const memberProfiles = homeData?.premiumMembers ?? [];
  const homeStats = homeData?.stats
    ? {
        activeProfiles: homeData.stats.activeProfiles,
        premiumMembers: homeData.stats.premiumMembers,
      }
    : fallbackHomeStats;
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const scrollCarousel = (direction: number) => {
    const carousel = carouselRef.current;
    if (!carousel) {
      return;
    }

    const firstCard = carousel.querySelector<HTMLElement>("[data-carousel-card]");
    const cardWidth = firstCard?.offsetWidth ?? 260;
    const gap = 16;

    carousel.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  };

  if (loading) return null;
  // A saved Home CMS configuration is rendered through the same section model
  // used by the editor, so every saved public change is immediately visible.
  if (page?.sections?.length) return <SitePageOverride page={page} />;
  if (page?.content || page?.contentBn || page?.contentEn) return <SitePageOverride page={page} />;

  return (
    <div className="home-page min-h-screen overflow-hidden bg-[#fffdfc] text-[#263b3a]">
      <Header />
      <main className="relative isolate overflow-x-hidden">
        <motion.section
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="home-hero relative isolate overflow-hidden bg-[#fff9f7] px-5 pb-14 pt-24 sm:px-8 lg:pb-16 lg:pt-32"
        >
          <div className="absolute -left-24 top-12 h-56 w-72 -rotate-12 rounded-[45%] bg-[#fce2df]/70 blur-2xl" />
          <div className="absolute -right-20 top-8 h-52 w-80 rotate-12 rounded-[45%] bg-[#fbe6e1]/65 blur-2xl" />
          <div
            className="home-hero-fade absolute inset-x-0 bottom-0 h-44"
            style={{
              backgroundImage: resolvedTheme === "dark"
                ? "linear-gradient(to top, #171412 0%, rgb(23 20 18 / 0.82) 46%, transparent 100%)"
                : "linear-gradient(to top, #fffdfc 0%, transparent 100%)",
            }}
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[.96fr_1.04fr] lg:gap-14">
            <div className="relative z-10 max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#efc5bf] bg-white/70 px-4 py-2 text-xs font-semibold text-[#b96862]">
                <Sparkles className="h-3.5 w-3.5" /> {t("homeEyebrow")}
              </div>
              <h1 className="max-w-[11ch] font-serif text-[2.75rem] leading-[1.08] tracking-normal text-[#174b4a] sm:max-w-xl sm:text-5xl sm:leading-[1.08] lg:text-6xl">{t("homeTitle")}</h1>
              <p className="mt-6 max-w-md text-base leading-7 text-[#5f7e7b]">{t("homeDescription")}</p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <HomeDashboardAction />
                <Link href="/success-stories" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-[#486866]">{t("seeSuccessStories")} <ArrowRight className="h-4 w-4" /></Link>
              </div>
                <HomeHeroStats stats={homeStats} />
            </div>
            <div className="relative mx-auto hidden h-115 w-full max-w-xl sm:block sm:h-125">
              <div className="absolute right-[2%] top-0 h-[94%] w-[84%] overflow-hidden rounded-[32%_32%_12%_12%] border-7 border-white bg-white shadow-[0_24px_55px_rgba(128,88,72,.18)] sm:right-[7%] sm:h-[88%] sm:w-[73%] sm:rounded-[46%_46%_20%_20%]"><Image src={image.couple} alt="Couple walking together" fill priority sizes="(min-width: 1024px) 38vw, 84vw" className="object-cover" /></div>
              <div className="absolute bottom-2 left-0 h-38 w-34 overflow-hidden rounded-3xl border-5 border-[#fff9f7] bg-white shadow-xl sm:h-48 sm:w-44"><Image src={image.celebration} alt="Wedding celebration" fill loading="eager" sizes="176px" className="object-cover" /></div>
              <div className="absolute bottom-10 right-0 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#486866] shadow-xl"><BadgeCheck className="h-5 w-5 text-[#3182ce]" /> {t("verifiedProfiles")}</div>
            </div>
          </div>
          <div className="relative mx-auto mt-8 w-full max-w-6xl">
            <HomeSearchForm />
          </div>
        </motion.section>

        <motion.section
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.2 }}
          className="relative px-5 py-18 sm:px-8 lg:py-22"
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e8897f]">{t("betterWay")}</p>
                <h2 className="mt-3 font-serif text-4xl text-[#263b3a] sm:text-5xl">{t("builtForReal")}</h2>
              </div>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[{ icon: ShieldCheck, title: t("trustFirst"), text: t("noEndlessNoise") }, { icon: Sparkles, title: t("smarterRecommendations"), text: t("communityDescription") }, { icon: Heart, title: t("madeForCommitment"), text: t("homeDescription") }].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-xl border border-[#f3dedb] bg-[#fffdfd] p-6 shadow-[0_10px_24px_rgba(88,111,109,0.035)]"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#fef0ef] text-[#e8897f]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl text-[#355350]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#78908c]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.2 }}
          className="bg-[#eff9f8] px-5 py-18 sm:px-8 lg:py-22"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e8897f]">{t("meetCommunity")}</p>
                  <h2 className="mt-3 font-serif text-4xl text-[#263b3a] sm:text-5xl">{t("peopleWorthKnowing")}</h2>
                </div>

                <Link href="/login" className="login-gradient-cta inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5">
                  {t("joinMarriageMedia")} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <p className="max-w-2xl text-sm leading-6 text-[#78908c]">
                {t("communityDescription")}
              </p>
            </div>

            <div className="mb-5 flex items-center justify-end gap-3">
              {memberProfiles.length > 0 ? (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => scrollCarousel(-1)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#bdd9d5] bg-white text-[#355350] transition hover:border-[#92b9b2] hover:bg-[#f8faf9]" aria-label="Previous members">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => scrollCarousel(1)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#bdd9d5] bg-white text-[#355350] transition hover:border-[#92b9b2] hover:bg-[#f8faf9]" aria-label="Next members">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>

            {memberProfiles.length ? (
              <div ref={carouselRef} className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pl-1 pr-1">
                {memberProfiles.map((member, index) => (
                  <Link
                    key={member.id}
                    href={`/profile/${member.id}`}
                    className="group block w-[85vw] max-w-60 shrink-0 snap-start sm:min-w-62 sm:max-w-62 lg:min-w-67.5 lg:max-w-67.5"
                  >
                    <div data-carousel-card className="w-full overflow-hidden rounded-[28px] border border-[#e9d6d1] bg-white shadow-[0_18px_35px_rgba(88,111,109,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_45px_rgba(88,111,109,0.16)]">
                      <div className="relative flex h-38 items-center justify-center overflow-hidden rounded-t-[28px] bg-linear-to-br from-[#f8e9e7] via-[#fdf7f5] to-[#e5f2ef] dark:from-[#263332] dark:via-[#1f2d2b] dark:to-[#172220] sm:h-44">
                        <Image
                          src={getProfilePlaceholderImage(member.gender)}
                          alt={member.gender === "Male" ? "Male member" : "Female member"}
                          fill
                          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 248px, 270px"
                          loading={index === 0 ? "eager" : "lazy"}
                          className="object-contain"
                        />

                        {member.isVerified ? (
                          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#dff8ee] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#235945] shadow-sm dark:bg-emerald-950 dark:text-emerald-200">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            {translateText("Verified")}
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-3 p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-[#355350]">{member.publicId}</p>
                            <p className="mt-1 text-sm text-[#6f8580]">
                              {member.age ? `${member.age} • ${formatMemberProfession(member.profession)}` : formatMemberProfession(member.profession)}
                            </p>
                          </div>
                          {member.isPremium ? (
                            <span className="rounded-full bg-[#fef0ef] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#b96862]">
                              {translateText("Premium")}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#6f8580]">
                          <MapPin className="h-3.5 w-3.5 text-[#e8897f]" />
                          <span className="truncate">{formatLocationText(member.location)}</span>
                        </div>

                        <div className="flex items-center justify-between border-t border-[#f0d6d1] pt-3">
                          <div className="flex items-center gap-3 text-[11px] text-[#6f8580]">
                            <span className="inline-flex items-center gap-1">
                              <BadgeCheck className="h-3.5 w-3.5 text-[#61b69e]" />
                              {member.isVerified ? translateText("Verified") : translateText("New")}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-[#355350]">{translateText("View profile")}&nbsp;→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-[26px] border border-[#e7d5d0] bg-white px-4 py-8 text-sm text-[#78908c]">{translateText("No member profiles are available right now.")}</div>
            )}

            <div className="mt-8 flex justify-center">
              <Link href="/login" className="login-gradient-cta inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5">
                {t("joinMarriageMedia")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.section>

        <CommunityStats />

        <motion.section
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.2 }}
          className="px-5 py-18 sm:px-8 lg:py-22"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e8897f]">{t("howItWorks")}</p>
              <h2 className="mt-3 font-serif text-4xl text-[#263b3a] sm:text-5xl">{t("threeSteps")}</h2>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {steps.map(({ icon: Icon, number, title, text }, index) => (
                <div key={number} className="relative p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-sm text-[#ef7190]">{number}</span>
                    {index < steps.length - 1 ? <ArrowRight className="h-5 w-5 text-[#d9a8a0]" /> : null}
                  </div>
                  <div className="mt-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#fef0ef] text-[#e8897f]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-serif text-2xl text-[#355350]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#78908c]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.2 }}
          className="bg-[#fff6f5] px-5 py-18 sm:px-8 lg:py-22"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
            <div className="relative p-2 text-[#263b3a] sm:p-5">
              <div className="relative flex h-full flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#f4b0a8]">{t("successStories")}</p>
                <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight sm:text-5xl">{translateText("The best love stories start with a conversation.")}</h2>
                <p className="mt-5 max-w-sm text-sm leading-6 text-[#78908c]">“We started with a simple conversation. Six months later, we knew.”</p>
                <Link href="/success-stories" className="login-gradient-cta mt-7 inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">{translateText("Read member stories")} <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
            <div className="relative h-70 overflow-hidden rounded-3xl shadow-[0_18px_35px_rgba(88,111,109,.12)] sm:h-80">
              <Image src={image.table} alt="Elegant wedding table" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.2 }}
          className="home-final-cta relative overflow-hidden bg-[#eff8f7] px-5 py-16 sm:px-8 lg:py-18"
        >
          <div className="absolute inset-0 opacity-45 dark:opacity-25"><Image src={image.bride} alt="" fill priority sizes="100vw" className="object-cover object-center" /></div>
          <div className="absolute inset-0 bg-linear-to-r from-[#fff9ee] via-[#fff9ee]/85 to-[#fff9ee]/15 dark:from-[#171412]/96 dark:via-[#171412]/90 dark:to-[#171412]/55" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e8897f] dark:text-[#fb9b90]">{translateText("Start today")}</p>
              <h2 className="mt-3 font-serif text-4xl text-[#263b3a] dark:text-[#fff7ed] sm:text-5xl">{translateText("A thoughtful beginning can change everything.")}</h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-[#78908c] dark:text-[#e7d8d2]">{translateText("Join a growing community of people looking for a partner, not just another profile.")}</p>
              <Link href="/login" className="login-gradient-cta mt-7 inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold">{translateText("Find your match")} <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="hidden lg:block" />
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}
