"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Users } from "lucide-react";
import { translateLocationLabel } from "@/lib/location-labels";
import { useLanguage } from "@/providers/language-provider";

type LocationOptions = {
  options: string[];
  labels?: Record<string, string>;
};
type LocationLevel = "divisions" | "districts" | "thanas";

async function fetchLocationOptions(level: LocationLevel, parameters: Record<string, string> = {}) {
  const query = new URLSearchParams({ level, ...parameters });
  const response = await fetch(`/api/locations?${query.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Location options are unavailable.");
  return (await response.json()) as LocationOptions;
}

export function HomeSearchForm() {
  const router = useRouter();
  const { language, translateText } = useLanguage();
  const [gender, setGender] = React.useState("");
  const [division, setDivision] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [thana, setThana] = React.useState("");
  const [divisions, setDivisions] = React.useState<LocationOptions>({ options: [] });
  const [districts, setDistricts] = React.useState<LocationOptions>({ options: [] });
  const [thanas, setThanas] = React.useState<LocationOptions>({ options: [] });
  const [locationError, setLocationError] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    void fetchLocationOptions("divisions")
      .then((result) => { if (active) setDivisions(result); })
      .catch(() => { if (active) setLocationError(true); });
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    if (!division) {
      setDistricts({ options: [] });
      return;
    }
    let active = true;
    void fetchLocationOptions("districts", { division })
      .then((result) => { if (active) setDistricts(result); })
      .catch(() => { if (active) setLocationError(true); });
    return () => { active = false; };
  }, [division]);

  React.useEffect(() => {
    if (!division || !district) {
      setThanas({ options: [] });
      return;
    }
    let active = true;
    void fetchLocationOptions("thanas", { division, district })
      .then((result) => { if (active) setThanas(result); })
      .catch(() => { if (active) setLocationError(true); });
    return () => { active = false; };
  }, [district, division]);

  const locationLabel = (option: string, data: LocationOptions) => {
    if (language !== "bn") return option;
    return data.labels?.[option] || translateLocationLabel(option, language);
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = new URLSearchParams({ gender, division, district, thana });
    router.push(`/search?${search.toString()}`);
  }

  const fieldClass = "h-14 w-full appearance-none rounded-xl border border-[#dce9e6] bg-[#fbfdfc] px-4 text-sm text-[#294441] outline-none transition duration-200 hover:border-[#b8d2cc] focus:border-[#dce9e6] focus:bg-[#fbfdfc] focus:ring-0 focus-visible:!outline-none focus-visible:ring-0 active:border-[#dce9e6] active:ring-0 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-slate-700 dark:focus:bg-slate-900 dark:disabled:bg-slate-800 dark:disabled:text-slate-500";

  return (
    <section aria-label={language === "bn" ? "পাত্র পাত্রী খুঁজুন" : "Search for a match"} className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_24px_70px_rgba(38,75,70,0.12)] backdrop-blur-xl sm:p-8 lg:p-9 mt-6 sm:mt-12 lg:mt-16">
      <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[#e6f3f0]/80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-48 w-48 rounded-full bg-[#fff0ec]/80 blur-3xl" />
      <div className="relative">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#e6f4f1] to-[#fdf0ed] text-[#28756b] shadow-inner dark:from-slate-800 dark:to-slate-900 dark:text-teal-300">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xl font-semibold tracking-tight text-[#244a46] dark:text-slate-100 sm:text-2xl">{translateText("Find your match")}</p>
              <p className="mt-1 text-sm leading-6 text-[#708984] dark:text-slate-300">{language === "bn" ? "আপনার পছন্দের পাত্র বা পাত্রী খুঁজুন" : "Choose a profile and location to get started"}</p>
            </div>
          </div>
          <span className="hidden items-center gap-2 self-start rounded-full border border-[#dcece8] bg-[#f5fbf9] px-3.5 py-2 text-xs font-medium text-[#4f7771] sm:inline-flex sm:self-auto dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <MapPin className="h-3.5 w-3.5 text-[#e8897f]" />
            {language === "bn" ? "আপনার পছন্দের এলাকায় খুঁজুন" : "Search by your preferred area"}
          </span>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.05fr_1fr_1fr_1fr_auto] xl:items-end">
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-semibold tracking-wide text-[#526d68] dark:text-slate-300">{language === "bn" ? "খুঁজছি" : "LOOKING FOR"}</span>
            <select required value={gender} onChange={(event) => setGender(event.target.value)} className={fieldClass}>
              <option value="">{language === "bn" ? "পাত্র বা পাত্রী নির্বাচন করুন" : "Select groom or bride"}</option>
              <option value="Male">{language === "bn" ? "পাত্র" : "Groom"}</option>
              <option value="Female">{language === "bn" ? "পাত্রী" : "Bride"}</option>
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-semibold tracking-wide text-[#526d68] dark:text-slate-300">{translateText("Division")}</span>
            <select required value={division} onChange={(event) => { setDivision(event.target.value); setDistrict(""); setThana(""); }} className={fieldClass}>
              <option value="">{translateText("Select division")}</option>
              {divisions.options.map((option) => <option key={option} value={option}>{locationLabel(option, divisions)}</option>)}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-semibold tracking-wide text-[#526d68] dark:text-slate-300">{translateText("District")}</span>
            <select required value={district} disabled={!division || !districts.options.length} onChange={(event) => { setDistrict(event.target.value); setThana(""); }} className={fieldClass}>
              <option value="">{translateText("Select district")}</option>
              {districts.options.map((option) => <option key={option} value={option}>{locationLabel(option, districts)}</option>)}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-semibold tracking-wide text-[#526d68] dark:text-slate-300">{translateText("Thana")}</span>
            <select required value={thana} disabled={!district || !thanas.options.length} onChange={(event) => setThana(event.target.value)} className={fieldClass}>
              <option value="">{translateText("Select thana")}</option>
              {thanas.options.map((option) => <option key={option} value={option}>{locationLabel(option, thanas)}</option>)}
            </select>
          </label>
          <button type="submit" className="login-gradient-cta group inline-flex h-14 items-center justify-center gap-3 rounded-xl px-6 text-sm font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#438b81]/30 focus-visible:ring-offset-2 sm:col-span-2 xl:col-span-1">
            <Search className="h-4 w-4 transition-transform group-hover:scale-110" />{translateText("Search Profiles")}
          </button>
        </form>
        {locationError ? <p role="status" className="mt-4 flex items-center gap-1.5 text-xs text-amber-700"><MapPin className="h-3.5 w-3.5" />{language === "bn" ? "ঠিকানার তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।" : "Could not load locations. Please try again."}</p> : null}
      </div>
    </section>
  );
}
