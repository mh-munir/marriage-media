"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatLocationValue } from "@/lib/location-labels";
import { useLanguage } from "@/providers/language-provider";
import { useAuthStore } from "@/stores/auth-store";

type PublicPhoto = { url: string; isPrimary: boolean };
type PublicProfile = {
  firstName: string;
  lastName: string;
  email?: string;
  contactNumber?: string;
  whatsappNumber?: string;
  gender: string;
  age: number;
  height: string;
  weight: string;
  bloodGroup?: string;
  complexion?: string;
  maritalStatus: string;
  maritalStatusDate?: string;
  childrenCount?: number;
  profileCreatedBy: string;
  religion: string;
  caste?: string;
  subCaste?: string;
  motherTongue: string;
  languages: string[];
  country: string;
  division: string;
  district: string;
  thana?: string;
  union?: string;
  area: string;
  nationality: string;
  highestEducation: string;
  institution?: string;
  profession: string;
  workingWith?: string;
  company?: string;
  annualIncome?: string;
  familyType: string;
  familyStatus: string;
  familyValues: string;
  fatherName?: string;
  motherName?: string;
  guardianRelation?: string;
  guardianName?: string;
  guardianMobileNumber?: string;
  permanentAddress?: string;
  presentAddress?: string;
  permanentLocation?: { country?: string; division?: string; district?: string; thana?: string; union?: string; area?: string };
  aboutYourself?: string;
  fatherContactNumber?: string;
  fatherProfession?: string;
  motherProfession?: string;
  numberOfSiblings?: number;
  siblingDetails?: string;
  siblings?: { name: string; relation: string }[];
  educationDetails?: { level: string; instituteName?: string; year?: string }[];
  habitAnswers?: Record<string, string>;
  familyAwareOfBiodata?: string;
  informationAccurate?: string;
  truthDeclaration?: string;
  acceptsFalseInformationLiability?: boolean;
  diet: string;
  smoke?: string;
  drink?: string;
  hobbies: string[];
  partnerPreference: string;
  partnerPreferences?: {
    age?: string;
    height?: string;
    weight?: string;
    maritalStatus?: string;
    religion?: string;
    highestEducation?: string;
    annualIncome?: string;
    country?: string;
    division?: string;
    district?: string;
    thana?: string;
    union?: string;
    area?: string;
    familyType?: string;
    familyStatus?: string;
    familyValues?: string;
    bloodGroup?: string;
    complexion?: string;
  };
  photos: PublicPhoto[];
  isPremium: boolean;
  isVerified: boolean;
  profileViews: number;
};

function formatBanglaHeight(value: string): string {
  const match = value.trim().match(/^(\d+)'(\d+)"\s*\((\d+)\s*cm\)$/i);
  if (!match) return value;

  const [, feet, inches, cm] = match;
  const toBanglaDigits = (input: string) => input.replace(/[0-9]/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);

  return `${toBanglaDigits(feet)} ফুট ${toBanglaDigits(inches)} ইঞ্চি (${toBanglaDigits(cm)} সে.মি.)`;
}

function Detail({ label, value, isPremiumField = false, currentUserIsPremium = true }: { label: string; value?: string | number; isPremiumField?: boolean; currentUserIsPremium?: boolean }) {
  const { language, translateText } = useLanguage();

  if (value === undefined || value === "" || value === 0) return null;
  if (isPremiumField && !currentUserIsPremium) return null;

  const isLocationField = ["Country", "Division", "District", "Thana", "Union", "Area"].includes(label);
  const displayValue = typeof value === "string"
    ? (() => {
        if (isLocationField) return formatLocationValue(value, language, translateText);
        if (label === "Height" && language === "bn") return formatBanglaHeight(value);
        if (label === "Nationality" && language === "bn") return formatLocationValue(value, language, translateText);
        return translateText(value);
      })()
    : value;

  return (
    <div className="grid grid-cols-[minmax(112px,34%)_1fr] gap-2 border-b border-[#d9a0a6]/45 py-1.5 text-xs leading-5 sm:text-sm">
      <dt className="font-semibold text-[#8d3d49]">{translateText(label)}</dt>
      <dd className="min-w-0 wrap-break-word text-[#4c3d40]">{displayValue}</dd>
    </div>
  );
}

function DetailsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-1 border-b-2 border-[#9b3f4c] pb-1 text-base font-bold text-[#7b2938]">{title}</h2>
      <dl>{children}</dl>
    </section>
  );
}

export function PublicProfileContent({ params }: { params: Promise<{ userId: string }> }) {
  const router = useRouter();
  const userId = useAuthStore((state) => state.user?.id);
  const { translateText } = useLanguage();
  const [profile, setProfile] = React.useState<PublicProfile | null>(null);
  const [hasFullProfileAccess, setHasFullProfileAccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const currentUserIsPremium = hasFullProfileAccess;

  React.useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const { userId: profileUserId } = await params;
        if (profileUserId === userId) {
          router.replace("/dashboard/profile");
          return;
        }
        const response = await fetch(`/api/profile/${profileUserId}`, { cache: "no-store" });
        const result = (await response.json()) as { profile?: PublicProfile; access?: { fullAccess?: boolean }; error?: string };
        if (!response.ok) throw new Error(result.error || "Unable to load profile.");
        if (active) {
          setProfile(result.profile || null);
          setHasFullProfileAccess(Boolean(result.access?.fullAccess));
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load profile.");
      }
    };
    void loadProfile();
    return () => { active = false; };
  }, [params, router, userId]);

  const handlePhotoClick = () => {
    if (!currentUserIsPremium) {
      toast.custom(
        () => (
          <div className="rounded-lg bg-white p-4 shadow-lg dark:bg-slate-950">
            <h3 className="mb-1 font-semibold">Premium Feature</h3>
            <p className="mb-3 text-sm text-muted-foreground">Subscribe to Premium to view full profile images.</p>
            <Button
              size="sm"
              variant="gradient"
              onClick={() => {
                window.location.href = "/pricing";
              }}
            >
              Upgrade Now
            </Button>
          </div>
        ),
        { duration: 5000 }
      );
    }
  };

  if (error) {
    return <><Header /><main className="mx-auto max-w-3xl px-4 pt-30 text-center"><p className="text-destructive">{error}</p><Link className="mt-4 inline-flex text-sm text-primary" href="/dashboard/search">Back to search</Link></main></>;
  }

  if (!profile) {
    return <><Header /><main className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main></>;
  }

  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || translateText("Marriage Media Member");
  const displayName = currentUserIsPremium ? name : translateText("User Profile");
  const photos = profile.photos.length ? profile.photos : [{ url: "", isPrimary: true }];
  const activePhoto = photos.find((photo) => photo.isPrimary) || photos[0];
  const photoCountLabel = `${currentUserIsPremium ? profile.photos.length : "?"} ${profile.photos.length === 1 ? translateText("photo") : translateText("photos")}`;
  const educationEntries = (profile.educationDetails || []).filter((education) => education.instituteName || education.year);

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-50/60 via-background to-background dark:from-rose-950/10">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-30 sm:px-6 lg:px-8">
        <Link href="/dashboard/search" className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to search</Link>
        <article className="relative mx-auto max-w-4xl overflow-hidden border border-[#d58d98] bg-[#fbe8ec] px-5 py-8 text-[#4c3d40] shadow-[0_18px_55px_rgba(102,44,55,0.16)] sm:px-12 sm:py-10">
          <span className="pointer-events-none absolute left-2 top-2 h-12 w-12 border-l-2 border-t-2 border-[#a83f50] sm:left-4 sm:top-4" />
          <span className="pointer-events-none absolute right-2 top-2 h-12 w-12 border-r-2 border-t-2 border-[#a83f50] sm:right-4 sm:top-4" />
          <span className="pointer-events-none absolute bottom-2 left-2 h-12 w-12 border-b-2 border-l-2 border-[#a83f50] sm:bottom-4 sm:left-4" />
          <span className="pointer-events-none absolute bottom-2 right-2 h-12 w-12 border-b-2 border-r-2 border-[#a83f50] sm:bottom-4 sm:right-4" />
          <div className="mx-auto max-w-3xl">
            <header className="relative min-h-36 pb-4 pr-28 text-center sm:min-h-40 sm:pr-36">
              <h1 className="mt-1 font-serif text-2xl font-bold tracking-[0.18em] text-[#7b2938] sm:text-3xl">{translateText("BIODATA")}</h1>
              <p className="mt-1 text-sm font-semibold text-[#9c4a55]">{displayName}</p>
              <div onClick={handlePhotoClick} className={`absolute right-0 top-6 h-28 w-24 overflow-hidden rounded-sm border border-[#c99aa1] bg-[#ead8da] sm:h-32 sm:w-28 ${!currentUserIsPremium ? "cursor-pointer opacity-50 hover:opacity-75" : ""}`}>
                {currentUserIsPremium && activePhoto.url ? (
                  <Image src={activePhoto.url} alt={name} fill priority loading="eager" sizes="112px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl font-bold text-[#a45b67]">{(currentUserIsPremium ? name : "Premium").slice(0, 2).toUpperCase()}</div>
                )}
              </div>
            </header>
            <section className="mt-5 py-4">
              <div className="mb-3 flex items-center justify-between border-b-2 border-[#9b3f4c] pb-1">
                <h2 className="text-sm font-bold text-[#7b2938]">{translateText("Profile Gallery")}</h2>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9c4a55]">{photoCountLabel}</span>
              </div>
              {currentUserIsPremium && profile.photos.length ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {photos.map((photo, index) => (
                    <div key={photo.url || `profile-photo-${index}`} className="relative aspect-[.82] overflow-hidden border border-[#d9a0a6] bg-[#ead8da] shadow-sm">
                      <Image src={photo.url} alt={`${name} profile photo ${index + 1}`} fill loading={index === 0 ? "eager" : "lazy"} sizes="(min-width: 640px) 150px, 45vw" className="object-cover transition duration-300 hover:scale-105" />
                    </div>
                  ))}
                </div>
              ) : !currentUserIsPremium ? (
                <div onClick={handlePhotoClick} className="cursor-pointer py-8 text-center text-sm text-[#8d6b70] hover:bg-[#f0d4d8] rounded-md">
                  <p className="font-semibold">🔒 {translateText("Photos are hidden")}</p>
                  <p>{translateText("Subscribe to Premium to view photos")}</p>
                </div>
              ) : (
                <p className="py-3 text-center text-sm text-[#8d6b70]">{translateText("No uploaded photos")}</p>
              )}
            </section>
            <div className="mt-5 space-y-5">
              <DetailsCard title={translateText("Personal Details")}>
                <Detail label="Name" value={currentUserIsPremium ? name : undefined} isPremiumField={!currentUserIsPremium} currentUserIsPremium={currentUserIsPremium} />
                <Detail label="Age" value={profile.age} />
                <Detail label="Gender" value={profile.gender} />
                <Detail label="Marital Status" value={profile.maritalStatus} />
                {profile.maritalStatus !== "Never Married" ? <Detail label="Number of Children" value={profile.childrenCount} /> : null}
                <Detail label="Profile Created By" value={profile.profileCreatedBy} />
                <Detail label="Religion" value={profile.religion} />
                <Detail label="Caste" value={profile.caste} />
                <Detail label="Sub-caste" value={profile.subCaste} />
                <Detail label="Mother Tongue" value={profile.motherTongue} />
                <Detail label="Languages" value={profile.languages?.join(", ")} />
                <Detail label="Nationality" value={profile.nationality} />
                <Detail label="Height" value={profile.height} />
                <Detail label="Weight" value={profile.weight} />
                <Detail label="Blood Group" value={profile.bloodGroup} />
                <Detail label="Complexion" value={profile.complexion} />
                <Detail label="Separation/Divorce Date" value={profile.maritalStatusDate ? new Date(profile.maritalStatusDate).toLocaleDateString() : undefined} />
              </DetailsCard>
              <DetailsCard title={translateText("Contact Details")}>
                <Detail label="Email" value={currentUserIsPremium ? profile.email : undefined} isPremiumField={!currentUserIsPremium} currentUserIsPremium={currentUserIsPremium} />
                <Detail label="Contact Number" value={currentUserIsPremium ? profile.contactNumber : undefined} isPremiumField={!currentUserIsPremium} currentUserIsPremium={currentUserIsPremium} />
                <Detail label="WhatsApp/Imo Number" value={currentUserIsPremium ? profile.whatsappNumber : undefined} isPremiumField={!currentUserIsPremium} currentUserIsPremium={currentUserIsPremium} />
                <Detail label="Country" value={profile.country} />
                <Detail label="Division" value={profile.division} />
                <Detail label="District" value={profile.district} />
                <Detail label="Thana" value={profile.thana} />
                <Detail label="Union" value={profile.union} />
                <Detail label="Area" value={currentUserIsPremium ? profile.area : undefined} isPremiumField={!currentUserIsPremium} currentUserIsPremium={currentUserIsPremium} />
              </DetailsCard>
              <DetailsCard title={translateText("Education & Career")}>
                <Detail label="Highest Education" value={profile.highestEducation} />
                <Detail label="Institution" value={profile.institution} />
                <Detail label="Profession" value={profile.profession} />
                <Detail label="Working With" value={profile.workingWith} />
                <Detail label="Company" value={profile.company} />
                <Detail label="Annual Income" value={profile.annualIncome} />
              </DetailsCard>
              {educationEntries.length ? (
                <DetailsCard title={translateText("Education Details")}>
                  <div className="space-y-2 pt-1">
                    {educationEntries.map((education) => (
                      <div key={education.level} className="grid gap-1 border-b border-[#d9a0a6]/45 py-2 sm:grid-cols-[minmax(112px,30%)_1fr_auto] sm:items-center sm:gap-3">
                        <span className="font-semibold text-[#8d3d49]">{translateText(education.level)}</span>
                        <span className="min-w-0 wrap-break-word text-sm text-[#4c3d40]">{education.instituteName || translateText("Not provided")}</span>
                        <span className="text-xs text-[#8d6b70]">{education.year || ""}</span>
                      </div>
                    ))}
                  </div>
                </DetailsCard>
              ) : null}
              <DetailsCard title={translateText("Family Details")}>
                <Detail label="Family Type" value={profile.familyType} />
                <Detail label="Family Status" value={profile.familyStatus} />
                <Detail label="Family Values" value={profile.familyValues} />
                <Detail label="Father's Name" value={profile.fatherName} />
                <Detail label="Mother's Name" value={profile.motherName} />
                <Detail label="Guardian" value={[profile.guardianRelation ? translateText(profile.guardianRelation) : "", profile.guardianName].filter(Boolean).join(": ")} />
                <Detail label="Guardian Mobile" value={profile.guardianMobileNumber} />
                <Detail label="Father's Contact" value={currentUserIsPremium ? profile.fatherContactNumber : undefined} isPremiumField={!currentUserIsPremium} currentUserIsPremium={currentUserIsPremium} />
                <Detail label="Father's Profession" value={profile.fatherProfession} />
                <Detail label="Mother's Name" value={profile.motherName} />
                <Detail label="Mother's Profession" value={profile.motherProfession} />
                <Detail label="Siblings" value={profile.siblings?.map((sibling) => `${sibling.name} (${translateText(sibling.relation)})`).join(", ") || profile.siblingDetails || profile.numberOfSiblings} />
              </DetailsCard>
              <DetailsCard title={translateText("Present Address")}>
                <Detail label="Address" value={profile.presentAddress} />
                <Detail label="Area" value={profile.area} isPremiumField={!currentUserIsPremium} currentUserIsPremium={currentUserIsPremium} />
                <Detail label="Union" value={profile.union} />
                <Detail label="Thana" value={profile.thana} />
                <Detail label="District" value={profile.district} />
                <Detail label="Division" value={profile.division} />
                <Detail label="Country" value={profile.country} />
              </DetailsCard>
              {currentUserIsPremium && profile.permanentLocation ? (
                <DetailsCard title={translateText("Permanent Address")}>
                  <Detail label="Address" value={profile.permanentAddress} />
                  <Detail label="Area" value={profile.permanentLocation.area} />
                  <Detail label="Union" value={profile.permanentLocation.union} />
                  <Detail label="Thana" value={profile.permanentLocation.thana} />
                  <Detail label="District" value={profile.permanentLocation.district} />
                  <Detail label="Division" value={profile.permanentLocation.division} />
                  <Detail label="Country" value={profile.permanentLocation.country} />
                </DetailsCard>
              ) : null}
              {profile.aboutYourself ? <DetailsCard title={translateText("About Me")}><p className="whitespace-pre-wrap text-sm text-muted-foreground">{profile.aboutYourself}</p></DetailsCard> : null}
              <DetailsCard title={translateText("Lifestyle Details")}>
                <Detail label="Diet" value={profile.diet} />
                <Detail label="Smoking" value={profile.smoke} />
                <Detail label="Drinking" value={profile.drink} />
                <Detail label="Hobbies" value={profile.hobbies?.map((hobby) => translateText(hobby)).join(", ")} />
                {["Exercise", "Reading", "Travel", "Cooking"].map((habit) => (
                  <Detail key={habit} label={translateText(habit)} value={profile.habitAnswers?.[habit]} />
                ))}
              </DetailsCard>
              <DetailsCard title={translateText("Expected Partner")}>
                <Detail label="Preference" value={profile.partnerPreference} />
                <Detail label="Age" value={profile.partnerPreferences?.age} />
                <Detail label="Height" value={profile.partnerPreferences?.height} />
                <Detail label="Weight" value={profile.partnerPreferences?.weight} />
                <Detail label="Blood Group" value={profile.partnerPreferences?.bloodGroup} />
                <Detail label="Complexion" value={profile.partnerPreferences?.complexion} />
                <Detail label="Marital Status" value={profile.partnerPreferences?.maritalStatus} />
                <Detail label="Religion" value={profile.partnerPreferences?.religion} />
                <Detail label="Highest Education" value={profile.partnerPreferences?.highestEducation} />
                <Detail label="Annual Income" value={profile.partnerPreferences?.annualIncome} />
                <Detail label="Country" value={profile.partnerPreferences?.country} />
                <Detail label="Division" value={profile.partnerPreferences?.division} />
                <Detail label="District" value={profile.partnerPreferences?.district} />
                <Detail label="Thana" value={profile.partnerPreferences?.thana} />
                <Detail label="Union" value={profile.partnerPreferences?.union} />
                <Detail label="Area" value={profile.partnerPreferences?.area} />
                <Detail label="Family Type" value={profile.partnerPreferences?.familyType} />
                <Detail label="Family Status" value={profile.partnerPreferences?.familyStatus} />
                <Detail label="Family Values" value={profile.partnerPreferences?.familyValues} />
              </DetailsCard>
              <DetailsCard title={translateText("Declarations")}>
                <Detail label="Family Aware Of Biodata" value={profile.familyAwareOfBiodata} isPremiumField currentUserIsPremium={currentUserIsPremium} />
                <Detail label="Information Accurate" value={profile.informationAccurate} isPremiumField currentUserIsPremium={currentUserIsPremium} />
                <Detail label="Truth Declaration" value={profile.truthDeclaration} isPremiumField currentUserIsPremium={currentUserIsPremium} />
                <Detail label="False Information Liability Accepted" value={profile.acceptsFalseInformationLiability ? "Yes" : undefined} isPremiumField currentUserIsPremium={currentUserIsPremium} />
              </DetailsCard>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
