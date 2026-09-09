"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  Eye,
  GraduationCap,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PublicPhoto = { url: string; isPrimary: boolean };
type PublicProfile = {
  firstName: string;
  lastName: string;
  contactNumber?: string;
  gender: string;
  age: number;
  height: string;
  weight: string;
  bloodGroup?: string;
  maritalStatus: string;
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
  fatherContactNumber?: string;
  fatherProfession?: string;
  motherName?: string;
  motherProfession?: string;
  numberOfSiblings?: number;
  siblingDetails?: string;
  siblings?: { name: string; relation: string }[];
  diet: string;
  smoke?: string;
  drink?: string;
  hobbies: string[];
  aboutMe: string;
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
    area?: string;
    familyType?: string;
    familyStatus?: string;
    familyValues?: string;
  };
  photos: PublicPhoto[];
  isPremium: boolean;
  isVerified: boolean;
  profileViews: number;
};

function Detail({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === "" || value === 0) return null;
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}

function DetailsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-4"><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
      <CardContent><dl className="grid gap-3 sm:grid-cols-2">{children}</dl></CardContent>
    </Card>
  );
}

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const [profile, setProfile] = React.useState<PublicProfile | null>(null);
  const [selectedPhoto, setSelectedPhoto] = React.useState(0);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const { userId } = await params;
        const response = await fetch(`/api/profile/${userId}`, { cache: "no-store" });
        const result = (await response.json()) as { profile?: PublicProfile; error?: string };
        if (!response.ok) throw new Error(result.error || "Unable to load profile.");
        if (active) setProfile(result.profile || null);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load profile.");
      }
    };
    void loadProfile();
    return () => { active = false; };
  }, [params]);

  if (error) {
    return <><Header /><main className="mx-auto max-w-3xl px-4 pt-30 text-center"><p className="text-destructive">{error}</p><Link className="mt-4 inline-flex text-sm text-primary" href="/dashboard/search">Back to search</Link></main></>;
  }

  if (!profile) {
    return <><Header /><main className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main></>;
  }

  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Marriage Media Member";
  const location = [profile.area, profile.district, profile.division, profile.country].filter(Boolean).join(", ");
  const photos = profile.photos.length ? profile.photos : [{ url: "", isPrimary: true }];
  const activePhoto = photos[selectedPhoto] || photos[0];

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-50/60 via-background to-background dark:from-rose-950/10">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-30 sm:px-6 lg:px-8">
        <Link href="/dashboard/search" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to search</Link>
        <section className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xl shadow-rose-950/5">
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <div className="bg-muted/30 p-3 sm:p-5 lg:p-7">
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-linear-to-br from-rose-100 via-pink-50 to-orange-100 dark:from-rose-950/50 dark:via-pink-950/30 dark:to-orange-950/30">
                {activePhoto.url ? <Image src={activePhoto.url} alt={name} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" /> : <div className="flex h-full items-center justify-center text-7xl font-bold text-primary/30">{name.slice(0, 2).toUpperCase()}</div>}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-linear-to-t from-black/60 to-transparent p-5 pt-16 text-white"><span className="text-xs font-medium uppercase tracking-widest">{photos.length} {photos.length === 1 ? "photo" : "photos"}</span>{activePhoto.isPrimary ? <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">Primary photo</span> : null}</div>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {photos.slice(0, 5).map((photo, index) => <button key={photo.url || `placeholder-${index}`} type="button" onClick={() => setSelectedPhoto(index)} className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${selectedPhoto === index ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-75 hover:opacity-100"}`} aria-label={`Show photo ${index + 1}`}>{photo.url ? <Image src={photo.url} alt={`${name} photo ${index + 1}`} fill sizes="100px" className="object-cover" /> : <span className="flex h-full items-center justify-center bg-primary/10 text-xl font-bold text-primary/40">{name.slice(0, 2).toUpperCase()}</span>}</button>)}
              </div>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap gap-2">{profile.isVerified ? <Badge variant="verified"><ShieldCheck className="mr-1 h-3.5 w-3.5" />Verified</Badge> : null}{profile.isPremium ? <Badge variant="premium"><Sparkles className="mr-1 h-3.5 w-3.5" />Premium member</Badge> : null}</div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
              <p className="mt-2 text-muted-foreground">{[profile.age && `${profile.age} years`, profile.gender, profile.maritalStatus].filter(Boolean).join(" · ")}</p>
              <div className="mt-7 space-y-4 text-sm"><p className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><span>{location || "Location not added"}</span></p><p className="flex items-center gap-3"><BriefcaseBusiness className="h-5 w-5 text-primary" /><span>{profile.profession || "Profession not added"}</span></p><p className="flex items-center gap-3"><GraduationCap className="h-5 w-5 text-primary" /><span>{profile.highestEducation || "Education not added"}</span></p></div>
              <div className="mt-8 grid grid-cols-2 gap-3 border-y border-border py-5"><div><p className="text-2xl font-bold">{profile.profileViews || 0}</p><p className="text-xs text-muted-foreground">Profile views</p></div><div><p className="text-2xl font-bold">{profile.photos.length}</p><p className="text-xs text-muted-foreground">Uploaded photos</p></div></div>
              {profile.aboutMe ? <div className="mt-7"><p className="mb-2 text-sm font-semibold">About {profile.firstName}</p><p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{profile.aboutMe}</p></div> : null}
            </div>
          </div>
        </section>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <DetailsCard title="Basic information"><Detail label="Contact number" value={profile.contactNumber} /><Detail label="Height" value={profile.height} /><Detail label="Weight" value={profile.weight} /><Detail label="Blood group" value={profile.bloodGroup} /><Detail label="Profile created by" value={profile.profileCreatedBy} /><Detail label="Religion" value={profile.religion} /><Detail label="Caste" value={profile.caste} /><Detail label="Sub-caste" value={profile.subCaste} /><Detail label="Mother tongue" value={profile.motherTongue} /><Detail label="Languages" value={profile.languages?.join(", ")} /><Detail label="Nationality" value={profile.nationality} /></DetailsCard>
          <DetailsCard title="Location"><Detail label="Country" value={profile.country} /><Detail label="Division" value={profile.division} /><Detail label="District" value={profile.district} /><Detail label="Thana" value={profile.thana} /><Detail label="Union" value={profile.union} /><Detail label="Area" value={profile.area} /></DetailsCard>
          <DetailsCard title="Education & career"><Detail label="Highest education" value={profile.highestEducation} /><Detail label="Institution" value={profile.institution} /><Detail label="Working with" value={profile.workingWith} /><Detail label="Company" value={profile.company} /><Detail label="Annual income" value={profile.annualIncome} /></DetailsCard>
          <DetailsCard title="Family information"><Detail label="Family type" value={profile.familyType} /><Detail label="Family status" value={profile.familyStatus} /><Detail label="Family values" value={profile.familyValues} /><Detail label="Father's name" value={profile.fatherName} /><Detail label="Father's contact number" value={profile.fatherContactNumber} /><Detail label="Father's profession" value={profile.fatherProfession} /><Detail label="Mother's name" value={profile.motherName} /><Detail label="Mother's profession" value={profile.motherProfession} /><Detail label="Brothers and sisters" value={profile.siblings?.map((sibling) => `${sibling.name} (${sibling.relation})`).join(", ") || profile.siblingDetails || profile.numberOfSiblings} /></DetailsCard>
          <DetailsCard title="Lifestyle & preferences"><Detail label="Diet" value={profile.diet} /><Detail label="Smoking" value={profile.smoke} /><Detail label="Drinking" value={profile.drink} /><Detail label="Hobbies" value={profile.hobbies?.join(", ")} /><Detail label="Partner preference" value={profile.partnerPreference} /></DetailsCard>
          <DetailsCard title="Expected partner"><Detail label="Age" value={profile.partnerPreferences?.age} /><Detail label="Height" value={profile.partnerPreferences?.height} /><Detail label="Weight" value={profile.partnerPreferences?.weight} /><Detail label="Marital status" value={profile.partnerPreferences?.maritalStatus} /><Detail label="Religion" value={profile.partnerPreferences?.religion} /><Detail label="Highest education" value={profile.partnerPreferences?.highestEducation} /><Detail label="Annual income" value={profile.partnerPreferences?.annualIncome} /><Detail label="Country" value={profile.partnerPreferences?.country} /><Detail label="Division" value={profile.partnerPreferences?.division} /><Detail label="District" value={profile.partnerPreferences?.district} /><Detail label="Area" value={profile.partnerPreferences?.area} /><Detail label="Family type" value={profile.partnerPreferences?.familyType} /><Detail label="Family status" value={profile.partnerPreferences?.familyStatus} /><Detail label="Family values" value={profile.partnerPreferences?.familyValues} /></DetailsCard>
        </div>
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><Eye className="h-4 w-4" />Public profile · <Check className="h-4 w-4 text-emerald-500" />Information shared by member</div>
      </main>
    </div>
  );
}
