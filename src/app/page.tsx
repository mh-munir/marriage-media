"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  MessageCircleHeart,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HomeDashboardAction } from "@/app/home-dashboard-action";
import { SitePageOverride, useSitePage } from "@/components/seo/site-page-override";

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

const memberCards = [
  { name: "Aisha Khan", detail: "Dhaka · 27", image: image.portraitOne },
  { name: "Rafi Ahmed", detail: "Chattogram · 30", image: image.portraitTwo },
  { name: "Nusrat Jahan", detail: "Sylhet · 26", image: image.portraitThree },
  { name: "Arif Rahman", detail: "Rajshahi · 29", image: image.portraitFour },
];

const steps = [
  { icon: Search, number: "01", title: "Tell us your story", text: "Share the values, dreams, and little details that make you, you." },
  { icon: Sparkles, number: "02", title: "Discover your match", text: "Explore thoughtful recommendations shaped around what matters to you." },
  { icon: MessageCircleHeart, number: "03", title: "Start something real", text: "Connect safely and take the next step at your own pace." },
];

export default function HomePage() {
  const { page, loading } = useSitePage("home");
  if (loading) return null;
  if (page?.content || page?.sections?.length) return <SitePageOverride page={page} />;

  return (
    <div className="home-page min-h-screen overflow-hidden bg-[#fffdfc] text-[#263b3a]">
      <Header />
      <main>
        <section className="relative bg-[#f7efee] px-5 pb-16 pt-28 sm:px-8 lg:pb-24 lg:pt-36">
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#f7c9c3]/40 blur-3xl" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-20">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#efc5bf] bg-white/70 px-4 py-2 text-xs font-semibold text-[#b96862]">
                <Sparkles className="h-3.5 w-3.5" /> Meaningful connections, made simpler
              </div>
              <h1 className="font-serif text-5xl leading-[.96] text-[#223c3a] sm:text-7xl">Meet someone who feels like <span className="text-[#e8897f]">home.</span></h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-[#6c817e]">Marriage Media helps you find a genuine life partner through thoughtful matching, verified profiles, and conversations that matter.</p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <HomeDashboardAction />
                <Link href="/success-stories" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-[#486866]">See success stories <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="mt-11 flex flex-wrap gap-6 border-t border-[#e8cbc7] pt-5 text-sm text-[#607572]">
                <span><strong className="text-lg text-[#263b3a]">25k+</strong><br />active members</span>
                <span><strong className="text-lg text-[#263b3a]">4.9/5</strong><br />member rating</span>
                <span><strong className="text-lg text-[#263b3a]">100%</strong><br />privacy focused</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative mx-auto h-115 w-full max-w-lg sm:h-140">
              <div className="absolute right-0 top-0 h-[88%] w-[78%] overflow-hidden rounded-[180px_180px_12px_12px] border-8 border-white bg-white shadow-2xl shadow-[#7b5d59]/15"><img src={image.couple} alt="Couple walking together" className="h-full w-full object-cover" /></div>
              <div className="absolute bottom-0 left-0 h-48 w-44 overflow-hidden rounded-2xl border-8 border-[#f7efee] bg-white shadow-xl sm:h-56 sm:w-52"><img src={image.celebration} alt="Wedding celebration" className="h-full w-full object-cover" /></div>
              <div className="absolute bottom-10 right-0 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#486866] shadow-xl"><BadgeCheck className="h-5 w-5 text-[#61b69e]" /> Verified profiles</div>
            </motion.div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e8897f]">A better way to meet</p><h2 className="mt-3 font-serif text-4xl text-[#263b3a] sm:text-5xl">Built for something real.</h2></div><p className="max-w-sm text-sm leading-6 text-[#78908c]">No endless noise. Just a warm, trusted space for people who are ready for a meaningful relationship.</p></motion.div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[{ icon: ShieldCheck, title: "Trust comes first", text: "Verification and privacy tools help you connect with confidence." }, { icon: Sparkles, title: "Smarter recommendations", text: "Find people who align with your values, lifestyle, and future plans." }, { icon: Heart, title: "Made for commitment", text: "A community for genuine conversations and lasting partnerships." }].map(({ icon: Icon, title, text }, index) => <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="border-t-2 border-[#f1b3ac] px-1 pt-5"><Icon className="h-6 w-6 text-[#e8897f]" /><h3 className="mt-5 font-serif text-2xl text-[#355350]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#78908c]">{text}</p></motion.div>)}
            </div>
          </div>
        </section>

        <section className="bg-[#eff8f7] px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e8897f]">Meet the community</p><h2 className="mt-3 font-serif text-4xl text-[#263b3a] sm:text-5xl">People worth getting to know.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#78908c]">Every profile is a person with a story, a family, and hopes for the future. Start with a hello.</p><Link href="/register" className="mt-7 inline-flex items-center gap-2 rounded-xl border border-[#9fcfc7] bg-white px-5 py-3 text-sm font-semibold text-[#486866]">Join Marriage Media <ArrowRight className="h-4 w-4" /></Link></motion.div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{memberCards.map((member, index) => <motion.div key={member.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}><Link href="/register" className="group"><div className="overflow-hidden rounded-2xl bg-white p-1 shadow-sm"><img src={member.image} alt={member.name} className="aspect-[.82] w-full rounded-xl object-cover grayscale-15 transition duration-500 group-hover:scale-105 group-hover:grayscale-0" /></div><p className="mt-3 text-sm font-semibold text-[#355350]">{member.name}</p><p className="mt-1 text-xs text-[#8aa19d]">{member.detail}</p></Link></motion.div>)}</div></div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto max-w-6xl"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e8897f]">How it works</p><h2 className="mt-3 font-serif text-4xl text-[#263b3a] sm:text-5xl">Three steps to your next chapter.</h2></motion.div><div className="mt-12 grid gap-8 md:grid-cols-3">{steps.map(({ icon: Icon, number, title, text }, index) => <motion.div key={number} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="relative border-l border-[#d6e8e4] pl-6"><span className="font-serif text-5xl text-[#f1d2ce]">{number}</span><Icon className="mt-4 h-6 w-6 text-[#e8897f]" /><h3 className="mt-4 font-serif text-2xl text-[#355350]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#78908c]">{text}</p></motion.div>)}</div></div></section>

        <section className="px-5 pb-20 sm:px-8 lg:pb-28"><div className="mx-auto grid max-w-6xl items-stretch gap-6 lg:grid-cols-[1.05fr_.95fr]"><motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative min-h-105 overflow-hidden rounded-3xl bg-[#294845] p-8 text-white sm:p-12"><img src={image.table} alt="Elegant wedding table" className="absolute inset-0 h-full w-full object-cover opacity-35" /><div className="relative flex h-full flex-col justify-end"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#f4b0a8]">Real stories, real hope</p><h2 className="mt-4 max-w-md font-serif text-4xl leading-tight sm:text-5xl">The best love stories start with a conversation.</h2><Link href="/success-stories" className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#355350]">Read member stories <ArrowRight className="h-4 w-4" /></Link></div></motion.div><motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex flex-col justify-between rounded-3xl bg-[#f7efee] p-8 sm:p-12"><div><Heart className="h-7 w-7 text-[#e8897f]" /><h2 className="mt-5 font-serif text-4xl leading-tight text-[#263b3a]">Your person is out there.</h2><p className="mt-4 text-sm leading-6 text-[#78908c]">Take the first step toward a relationship built on trust, kindness, and shared direction.</p></div><Link href="/register" className="mt-10 inline-flex w-fit items-center gap-2 rounded-xl bg-[#e8897f] px-5 py-3 text-sm font-semibold text-white">Create your free profile <ArrowRight className="h-4 w-4" /></Link></motion.div></div></section>

        <section className="bg-[#eff8f7] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[.85fr_1.15fr]"><motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e8897f]">Start today</p><h2 className="mt-3 font-serif text-4xl text-[#263b3a] sm:text-5xl">A thoughtful beginning can change everything.</h2><p className="mt-5 max-w-md text-sm leading-6 text-[#78908c]">Join a growing community of people looking for a partner, not just another profile.</p><Link href="/register" className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#294845] px-6 py-3.5 text-sm font-semibold text-white">Find your match <ArrowRight className="h-4 w-4" /></Link></motion.div><motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }} className="relative h-72 overflow-hidden rounded-3xl"><img src={image.bride} alt="Wedding details" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-linear-to-r from-[#294845]/40 to-transparent" /></motion.div></div></section>
      </main>
      <Footer />
    </div>
  );
}