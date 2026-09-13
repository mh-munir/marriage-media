"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Save,
  Loader2,
  CheckCircle,
  Heart,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  RELIGIONS,
  EDUCATION_LEVELS,
  PROFESSIONS,
  HEIGHTS,
  WEIGHTS,
  INCOME_RANGES,
  sanitizePhoneNumberInput,
} from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useLanguage } from "@/providers/language-provider";

interface ProfileFormData {
  email: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  height: string;
  weight: string;
  maritalStatus: string;
  religion: string;
  motherTongue: string;
  country: string;
  division: string;
  district: string;
  thana: string;
  union: string;
  area: string;
  highestEducation: string;
  institution: string;
  profession: string;
  company: string;
  annualIncome: string;
  familyType: string;
  familyStatus: string;
  familyValues: string;
  fatherName: string;
  fatherContactNumber: string;
  motherName: string;
  siblings: Array<{ name: string; relation: "Brother" | "Sister" }>;
  partnerPreference: string;
  partnerPreferences: {
    age: string;
    height: string;
    weight: string;
    maritalStatus: string;
    religion: string;
    highestEducation: string;
    annualIncome: string;
    country: string;
    division: string;
    district: string;
    thana: string;
    union: string;
    area: string;
    familyType: string;
    familyStatus: string;
    familyValues: string;
  };
  showContactInfo: boolean;
  isVisible: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
  photos: Array<{ url: string; publicId: string; isPrimary: boolean; isApproved: boolean }>;
}

const createInitialProfile = (): ProfileFormData => ({
  email: "",
  mobileNumber: "",
  firstName: "",
  lastName: "",
  gender: "Male",
  dateOfBirth: "",
  height: HEIGHTS[0],
  weight: WEIGHTS[0],
  maritalStatus: "Never Married",
  religion: RELIGIONS[0],
  motherTongue: "Bengali",
  country: "Bangladesh",
  division: "",
  district: "",
  thana: "",
  union: "",
  area: "",
  highestEducation: EDUCATION_LEVELS[0],
  institution: "",
  profession: PROFESSIONS[0],
  company: "",
  annualIncome: INCOME_RANGES[0],
  familyType: "Nuclear",
  familyStatus: "Middle Class",
  familyValues: "Moderate",
  fatherName: "",
  fatherContactNumber: "",
  motherName: "",
  siblings: [],
  partnerPreference: "",
  partnerPreferences: {
    age: "",
    height: "",
    weight: "",
    maritalStatus: "",
    religion: "",
    highestEducation: "",
    annualIncome: "",
    country: "Bangladesh",
    division: "",
    district: "",
    thana: "",
    union: "",
    area: "",
    familyType: "",
    familyStatus: "",
    familyValues: "",
  },
  showContactInfo: false,
  isVisible: true,
  isPremium: false,
  isVerified: false,
  photos: [],
});

const PARTNER_HEIGHT_RANGES = [
  { value: "4'10\"-5'0\"", label: "4'10\" - 5'0\"" },
  { value: "5'1\"-5'3\"", label: "5'1\" - 5'3\"" },
  { value: "5'4\"-5'6\"", label: "5'4\" - 5'6\"" },
  { value: "5'7\"-5'9\"", label: "5'7\" - 5'9\"" },
  { value: "5'10\"-6'0\"", label: "5'10\" - 6'0\"" },
  { value: "6'1\"-6'3\"", label: "6'1\" - 6'3\"" },
] as const;

const formatDateForInput = (value?: string | Date | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.trim().charAt(0) || "";
  const last = lastName?.trim().charAt(0) || "";
  return `${first}${last}`.toUpperCase() || "U";
};

type LocationLevel = "divisions" | "districts" | "thanas" | "unions";

type LocationOptions = {
  divisions: string[];
  districts: string[];
  thanas: string[];
  unions: string[];
};

const emptyLocationOptions: LocationOptions = {
  divisions: [],
  districts: [],
  thanas: [],
  unions: [],
};

async function fetchLocationOptions(level: LocationLevel, params: Record<string, string> = {}) {
  const query = new URLSearchParams({ level, ...params });
  const response = await fetch(`/api/locations?${query.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load location options.");
  const data = (await response.json()) as { options?: string[] };
  return data.options || [];
}

export default function DashboardProfilePage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("basic");
  const [error, setError] = React.useState("");
  const [profileExists, setProfileExists] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [profile, setProfile] = React.useState<ProfileFormData>(createInitialProfile());
  const [locationOptions, setLocationOptions] = React.useState<LocationOptions>(emptyLocationOptions);
  const { updateUser } = useAuthStore();
  const { translateText: text } = useLanguage();

  React.useEffect(() => {
    const activateSectionFromHash = () => {
      if (window.location.hash === "#expected-partner") setActiveSection("expected-partner");
    };
    activateSectionFromHash();
    window.addEventListener("hashchange", activateSectionFromHash);
    return () => window.removeEventListener("hashchange", activateSectionFromHash);
  }, []);

  React.useEffect(() => {
    void fetchLocationOptions("divisions").then((divisions) => {
      setLocationOptions((current) => ({ ...current, divisions }));
    });
  }, []);

  React.useEffect(() => {
    let active = true;
    if (!profile.division) {
      void Promise.resolve().then(() => {
        if (active) setLocationOptions((current) => ({ ...current, districts: [], thanas: [], unions: [] }));
      });
      return () => { active = false; };
    }
    void fetchLocationOptions("districts", { division: profile.division }).then((districts) => {
      if (active) setLocationOptions((current) => ({ ...current, districts, thanas: [], unions: [] }));
    });
    return () => { active = false; };
  }, [profile.division]);

  React.useEffect(() => {
    let active = true;
    if (!profile.division || !profile.district) {
      void Promise.resolve().then(() => {
        if (active) setLocationOptions((current) => ({ ...current, thanas: [], unions: [] }));
      });
      return () => { active = false; };
    }
    void fetchLocationOptions("thanas", { division: profile.division, district: profile.district }).then((thanas) => {
      if (active) setLocationOptions((current) => ({ ...current, thanas, unions: [] }));
    });
    return () => { active = false; };
  }, [profile.division, profile.district]);

  React.useEffect(() => {
    let active = true;
    if (!profile.district || !profile.thana) {
      void Promise.resolve().then(() => {
        if (active) setLocationOptions((current) => ({ ...current, unions: [] }));
      });
      return () => { active = false; };
    }
    void fetchLocationOptions("unions", { division: profile.division, district: profile.district, thana: profile.thana }).then((unions) => {
      if (active) setLocationOptions((current) => ({ ...current, unions }));
    });
    return () => { active = false; };
  }, [profile.division, profile.district, profile.thana]);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await apiClient.get<{ profile?: Partial<ProfileFormData>; mobileNumber?: string; onboarding?: Partial<ProfileFormData> }>('/api/profile');
        const profileData = response.profile;

        if (profileData) {
          setProfile({
            ...createInitialProfile(),
            ...profileData,
            mobileNumber: response.mobileNumber || "",
            partnerPreferences: {
              ...createInitialProfile().partnerPreferences,
              ...(profileData.partnerPreferences || {}),
              country: profileData.partnerPreferences?.country || "Bangladesh",
            },
            dateOfBirth: formatDateForInput(profileData.dateOfBirth),
          });
          updateUser({
            avatar: profileData.photos?.find((photo) => photo.isPrimary)?.url || "",
          });
          setProfileExists(true);
        } else {
          setProfile((current) => ({
            ...current,
            firstName: response.onboarding?.firstName || current.firstName,
            lastName: response.onboarding?.lastName || current.lastName,
            gender: response.onboarding?.gender || current.gender,
            mobileNumber: response.mobileNumber || current.mobileNumber,
          }));
          setProfileExists(false);
        }
      } catch (err) {
        if (err instanceof Error && (err.message.includes("404") || err.message.includes("Profile not found"))) {
          setProfileExists(false);
          setProfile(createInitialProfile());
        } else {
          setError("We couldn't load your profile right now.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [updateUser]);

  const profileCompletion = React.useMemo(() => {
    const completionFields = [
      profile.firstName,
      profile.lastName,
      profile.gender,
      profile.dateOfBirth,
      profile.height,
      profile.maritalStatus,
      profile.religion,
      profile.motherTongue,
      profile.country,
      profile.division,
      profile.district,
      profile.highestEducation,
      profile.profession,
      Object.values(profile.partnerPreferences).some(Boolean),
    ];

    const completedFields = completionFields.filter((value) => Boolean(value && String(value).trim())).length;
    return Math.round((completedFields / completionFields.length) * 100);
  }, [profile]);

  const getMissingRequiredFields = () => {
    const requiredFields = [
      { value: profile.firstName, label: "First Name" },
      { value: profile.lastName, label: "Last Name" },
      { value: profile.gender, label: "Gender" },
      { value: profile.dateOfBirth, label: "Date of Birth" },
      { value: profile.height, label: "Height" },
      { value: profile.maritalStatus, label: "Marital Status" },
      { value: profile.religion, label: "Religion" },
      { value: profile.motherTongue, label: "Mother Tongue" },
      { value: profile.country, label: "Country" },
      { value: profile.division, label: "Division" },
      { value: profile.district, label: "District" },
      { value: profile.highestEducation, label: "Highest Education" },
      { value: profile.profession, label: "Profession" },
    ];
    const missingFields = requiredFields
      .filter(({ value }) => !String(value || "").trim())
      .map(({ label }) => label);

    if (!Object.values(profile.partnerPreferences).some((value) => String(value || "").trim())) {
      missingFields.push("At least one Expected Partner preference");
    }
    if (profile.photos.length < 2) missingFields.push("At least 2 profile photos");
    return missingFields;
  };

  const handleSave = async () => {
    if (isSaving) return;

    const missingFields = getMissingRequiredFields();
    if (missingFields.length) {
      setError(`Please complete these fields before saving: ${missingFields.join(", ")}.`);
      setActiveSection(missingFields.includes("At least 2 profile photos") ? "photos" : "basic");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const payload = {
        ...profile,
        dateOfBirth: profile.dateOfBirth || undefined,
      };

      const response = profileExists
        ? await apiClient.put<{ profile: ProfileFormData }>('/api/profile', payload)
        : await apiClient.post<{ profile: ProfileFormData }>('/api/profile', payload);

      const savedProfile = response.profile;
      setProfile({
        ...createInitialProfile(),
        ...savedProfile,
        mobileNumber: profile.mobileNumber,
        partnerPreferences: {
          ...createInitialProfile().partnerPreferences,
          ...(savedProfile.partnerPreferences || {}),
          country: savedProfile.partnerPreferences?.country || "Bangladesh",
        },
        dateOfBirth: formatDateForInput(savedProfile.dateOfBirth),
      });
      setProfileExists(true);
      updateUser({
        firstName: savedProfile.firstName,
        lastName: savedProfile.lastName,
        profileCompleted: profileCompletion,
        avatar: savedProfile.photos?.find((photo) => photo.isPrimary)?.url || "",
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    if (profile.photos.length + files.length > 5) {
      setError("You can upload a maximum of 5 images.");
      return;
    }

    setIsUploading(true);
    setError("");
    try {
      const uploaded: ProfileFormData["photos"] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/profile/photos/upload", {
          method: "POST",
          body: formData,
          headers: { Authorization: `Bearer ${useAuthStore.getState().token || ""}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Image upload failed");
        uploaded.push(result.photo);
      }
      const normalizedUploaded = uploaded.map((photo, index) => ({
        ...photo,
        isPrimary: profile.photos.length === 0 && index === 0,
      }));
      setProfile((current) => ({ ...current, photos: [...current.photos, ...normalizedUploaded] }));
      const primaryPhoto = normalizedUploaded.find((photo) => photo.isPrimary);
      if (primaryPhoto) updateUser({ avatar: primaryPhoto.url });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const sections = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "photos", label: "Photos", icon: Sparkles },
    { id: "expected-partner", label: "Expected partner", icon: Heart },
  ];

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your Profile";
  const primaryPhotoUrl = profile.photos.find((photo) => photo.isPrimary)?.url;

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-50/70 via-background to-background dark:from-rose-950/15">
      <Header />
      <main className="pb-16 pt-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-2xl"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your profile workspace</p>
            <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Your Profile</h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              Manage your profile information and preferences.
            </p>
          </motion.div>

          {error ? (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <Card className="relative mb-8 overflow-hidden border-rose-200/70 bg-linear-to-r from-white via-rose-50/80 to-orange-50/70 shadow-premium dark:border-rose-900/50 dark:from-card dark:via-rose-950/20 dark:to-orange-950/20">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-white shadow-md dark:border-stone-800">
                  <AvatarImage src={primaryPhotoUrl} alt={`${displayName} profile photo`} />
                  <AvatarFallback className="bg-linear-to-br from-rose-500 to-orange-400 text-xl font-bold text-white">
                    {getInitials(profile.firstName, profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold">{displayName}</h3>
                    <Badge variant="outline" className="text-xs">
                      {profile.isPremium ? "Premium" : "Free Plan"}
                    </Badge>
                    {profile.isVerified ? (
                      <Badge variant="outline" className="text-xs text-emerald-600">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Complete your profile to get better matches.</p>
                  <div className="flex max-w-md items-center gap-3">
                    <Progress value={profileCompletion} className="h-2 flex-1" />
                    <span className="text-xs font-semibold tabular-nums text-primary">{profileCompletion}%</span>
                  </div>
                </div>
                {!profile.isPremium ? (
                  <Button variant="gradient" size="sm" asChild>
                    <Link href="/pricing">Upgrade to Premium</Link>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-border/70 bg-background/80 shadow-sm backdrop-blur">
                <CardContent className="p-2 sm:p-3">
                  <nav className="space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-all ${
                          activeSection === section.id
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <section.icon className="h-4 w-4" />
                        {section.label}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            <div className="min-w-0 lg:col-span-3">
              {isLoading ? (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">
                    <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
                    Loading your profile...
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-5">
                  {activeSection === "photos" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{text("Profile Photos")}</CardTitle>
                        <p className="text-sm text-muted-foreground">{text("Upload at least 2 and up to 5 images.")}</p>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {!profileExists ? (
                          <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                            You can upload photos now. They will be saved with your profile.
                          </p>
                        ) : null}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                          {profile.photos.map((photo) => (
                            <div key={photo.publicId} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
                              <Image src={photo.url} alt="Profile" fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover" />
                              {photo.isPrimary ? <Badge className="absolute bottom-2 left-2">Primary</Badge> : null}
                            </div>
                          ))}
                          {profile.photos.length < 5 ? (
                            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary">
                              {isUploading ? <Loader2 className="mb-2 h-6 w-6 animate-spin" /> : <Sparkles className="mb-2 h-6 w-6" />}
                              {isUploading ? `${text("Uploading")}...` : text("Add images")}
                              <input type="file" accept="image/*" multiple className="sr-only" onChange={handleUpload} disabled={isUploading} />
                            </label>
                          ) : null}
                        </div>
                        <p className={`text-sm ${profile.photos.length < 2 ? "text-destructive" : "text-emerald-600"}`}>
                          {profile.photos.length}/5 images uploaded {profile.photos.length < 2 ? "(minimum 2 required)" : ""}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === "basic" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{text("Complete Your Profile")}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        <section>
                          <h2 className="mb-4 text-lg font-semibold">{text("Basic Information")}</h2>
                          <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Input
                            label="First Name"
                            value={profile.firstName}
                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          />
                          <Input
                            label="Last Name"
                            value={profile.lastName}
                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            label="Email (Optional)"
                            type="email"
                            placeholder="you@example.com"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          />
                          <Input
                            label="Mobile Number"
                            type="tel"
                            value={profile.mobileNumber}
                            readOnly
                            placeholder="Registered mobile number"
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{text("Gender")}</label>
                            <select
                              value={profile.gender}
                              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="Male">{text("Male")}</option>
                              <option value="Female">{text("Female")}</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">{text("Date of Birth")}</label>
                            <DatePicker
                              value={profile.dateOfBirth}
                              onChange={(dateOfBirth) => setProfile({ ...profile, dateOfBirth })}
                              placeholder="Select date of birth"
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{text("Marital Status")}</label>
                            <select
                              value={profile.maritalStatus}
                              onChange={(e) => setProfile({ ...profile, maritalStatus: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="Never Married">{text("Never Married")}</option>
                              <option value="Divorced">{text("Divorced")}</option>
                              <option value="Widowed">{text("Widowed")}</option>
                              <option value="Awaiting Divorce">{text("Awaiting Divorce")}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{text("Religion")}</label>
                            <select
                              value={profile.religion}
                              onChange={(e) => setProfile({ ...profile, religion: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              {RELIGIONS.map((r) => (
                                <option key={r} value={r}>{text(r)}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{text("Height")}</label>
                            <select
                              value={profile.height}
                              onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              {HEIGHTS.map((h) => (
                                <option key={h} value={h}>{text(h)}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{text("Weight")}</label>
                            <select
                              value={profile.weight}
                              onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              {WEIGHTS.map((w) => (
                                <option key={w} value={w}>{text(w)}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                          </div>
                        </section>

                        <section>
                          <h2 className="mb-4 text-lg font-semibold">{text("Family Information")}</h2>
                          <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            label="Father's Name"
                            value={profile.fatherName}
                            onChange={(e) => setProfile({ ...profile, fatherName: e.target.value })}
                          />
                          <Input
                            label="Father's Contact Number"
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={11}
                            minLength={11}
                            value={profile.fatherContactNumber}
                            onChange={(e) => setProfile({ ...profile, fatherContactNumber: sanitizePhoneNumberInput(e.target.value).slice(0, 11) })}
                          />
                        </div>
                        <Input
                          label="Mother's Name"
                          value={profile.motherName}
                          onChange={(e) => setProfile({ ...profile, motherName: e.target.value })}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{text("Family Type")}</label>
                            <select
                              value={profile.familyType}
                              onChange={(e) => setProfile({ ...profile, familyType: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="Joint">{text("Joint")}</option>
                              <option value="Nuclear">{text("Nuclear")}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{text("Family Status")}</label>
                            <select
                              value={profile.familyStatus}
                              onChange={(e) => setProfile({ ...profile, familyStatus: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="Middle Class">{text("Middle Class")}</option>
                              <option value="Upper Middle Class">{text("Upper Middle Class")}</option>
                              <option value="Rich">{text("Rich")}</option>
                              <option value="Affluent">{text("Affluent")}</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">{text("Family Values")}</label>
                          <select
                            value={profile.familyValues}
                            onChange={(e) => setProfile({ ...profile, familyValues: e.target.value })}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                          >
                            <option value="Orthodox">{text("Orthodox")}</option>
                            <option value="Traditional">{text("Traditional")}</option>
                            <option value="Moderate">{text("Moderate")}</option>
                            <option value="Liberal">{text("Liberal")}</option>
                            <option value="Secular">{text("Secular")}</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <label className="text-sm font-medium text-foreground">{text("Brothers and Sisters")}</label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setProfile({
                                ...profile,
                                siblings: [...profile.siblings, { name: "", relation: "Brother" }],
                              })}
                            >
                              Add sibling
                            </Button>
                          </div>
                          {profile.siblings.map((sibling, index) => (
                            <div key={`sibling-${index}`} className="flex items-end gap-3">
                              <Input
                                label={`Sibling ${index + 1} name`}
                                value={sibling.name}
                                onChange={(e) => setProfile({
                                  ...profile,
                                  siblings: profile.siblings.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, name: e.target.value } : item
                                  ),
                                })}
                              />
                              <div className="w-36 shrink-0">
                                <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Relation")}</label>
                                <select
                                  value={sibling.relation}
                                  onChange={(e) => setProfile({
                                    ...profile,
                                    siblings: profile.siblings.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? { ...item, relation: e.target.value as "Brother" | "Sister" }
                                        : item
                                    ),
                                  })}
                                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                                >
                                  <option value="Brother">{text("Brother")}</option>
                                  <option value="Sister">{text("Sister")}</option>
                                </select>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label={`Remove sibling ${index + 1}`}
                                onClick={() => setProfile({
                                  ...profile,
                                  siblings: profile.siblings.filter((_, itemIndex) => itemIndex !== index),
                                })}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          {!profile.siblings.length ? (
                            <p className="text-sm text-muted-foreground">{text("No brothers or sisters added.")}</p>
                          ) : null}
                        </div>
                          </div>
                        </section>

                        <section>
                          <h2 className="mb-4 text-lg font-semibold">{text("Location Information")}</h2>
                          <div className="space-y-4">
                        <Input
                          label="Country"
                          value={profile.country}
                          onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                        />
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{text("Division")}</label>
                            <select
                              value={profile.division}
                              onChange={(e) => setProfile({ ...profile, division: e.target.value, district: "", thana: "", union: "" })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">{text("Select division")}</option>
                              {locationOptions.divisions.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{text("District")}</label>
                            <select
                              value={profile.district}
                              onChange={(e) => setProfile({ ...profile, district: e.target.value, thana: "", union: "" })}
                              disabled={!profile.division}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="">{text(profile.division ? "Select district" : "Select division first")}</option>
                              {locationOptions.districts.map((district) => (
                                <option key={district} value={district}>{district}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{text("Thana")}</label>
                            <select
                              value={profile.thana}
                              onChange={(e) => setProfile({ ...profile, thana: e.target.value, union: "" })}
                              disabled={!profile.district}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="">{text(profile.district ? "Select thana" : "Select district first")}</option>
                              {locationOptions.thanas.map((thana) => (
                                <option key={thana} value={thana}>{thana}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{text("Union")}</label>
                            <select
                              value={profile.union}
                              onChange={(e) => setProfile({ ...profile, union: e.target.value })}
                              disabled={!profile.thana}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="">{text(profile.thana ? "Select union" : "Select thana first")}</option>
                              {locationOptions.unions.map((union) => (
                                <option key={union} value={union}>{union}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <Input
                          label="Area"
                          value={profile.area}
                          onChange={(e) => setProfile({ ...profile, area: e.target.value })}
                        />
                          </div>
                        </section>

                        <section>
                          <h2 className="mb-4 text-lg font-semibold">{text("Education & Career")}</h2>
                          <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">{text("Highest Education")}</label>
                          <select
                            value={profile.highestEducation}
                            onChange={(e) => setProfile({ ...profile, highestEducation: e.target.value })}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                          >
                            {EDUCATION_LEVELS.map((e) => (
                              <option key={e} value={e}>{text(e)}</option>
                            ))}
                          </select>
                        </div>
                        <Input
                          label="Institution"
                          value={profile.institution}
                          onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{text("Profession")}</label>
                          <select
                            value={profile.profession}
                            onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                          >
                            {PROFESSIONS.map((p) => (
                              <option key={p} value={p}>{text(p)}</option>
                            ))}
                          </select>
                        </div>
                        <Input
                          label="Company"
                          value={profile.company}
                          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        />
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">{text("Annual Income")}</label>
                          <select
                            value={profile.annualIncome}
                            onChange={(e) => setProfile({ ...profile, annualIncome: e.target.value })}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                          >
                            {INCOME_RANGES.map((i) => (
                              <option key={i} value={i}>{text(i)}</option>
                            ))}
                          </select>
                        </div>
                          </div>
                        </section>

                      </CardContent>
                    </Card>
                  )}

                  {activeSection === "expected-partner" && (
                    <div id="expected-partner" className="scroll-mt-24">
                    <Card>
                      <CardHeader>
                        <CardTitle>{text("Expected partner")}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {text("Tell us about the partner you are looking for.")}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Age")}</label>
                            <select
                              value={profile.partnerPreferences.age}
                              onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, age: e.target.value } })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">{text("Any age")}</option>
                              <option value="18-25">18-25</option>
                              <option value="26-30">26-30</option>
                              <option value="31-35">31-35</option>
                              <option value="36-40">36-40</option>
                              <option value="41-50">41-50</option>
                              <option value="51+">51+</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Height")}</label>
                            <select
                              value={profile.partnerPreferences.height}
                              onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, height: e.target.value } })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">{text("Any height")}</option>
                              {PARTNER_HEIGHT_RANGES.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Weight")}</label>
                            <select
                              value={profile.partnerPreferences.weight}
                              onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, weight: e.target.value } })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">{text("Any weight")}</option>
                              {WEIGHTS.map((weight) => <option key={weight} value={weight}>{text(weight)}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Marital Status")}</label>
                            <select
                              value={profile.partnerPreferences.maritalStatus}
                              onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, maritalStatus: e.target.value } })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">{text("Any status")}</option>
                              <option value="Never Married">Never Married</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                              <option value="Awaiting Divorce">Awaiting Divorce</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Religion")}</label>
                            <select
                              value={profile.partnerPreferences.religion}
                              onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, religion: e.target.value } })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">{text("Any religion")}</option>
                              {RELIGIONS.map((religion) => <option key={religion} value={religion}>{text(religion)}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Highest Education</label>
                            <select
                              value={profile.partnerPreferences.highestEducation}
                              onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, highestEducation: e.target.value } })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">Any education</option>
                              {EDUCATION_LEVELS.map((education) => <option key={education} value={education}>{text(education)}</option>)}
                            </select>
                          </div>
                          <Input
                            label="Annual Income"
                            placeholder="Example: 50,000-100,000"
                            value={profile.partnerPreferences.annualIncome}
                            onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, annualIncome: e.target.value } })}
                          />
                          <Input
                            label="Country"
                            value={profile.partnerPreferences.country}
                            onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, country: e.target.value } })}
                          />
                          <Input
                            label="Division"
                            placeholder="Example: Dhaka, Chattogram"
                            value={profile.partnerPreferences.division}
                            onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, division: e.target.value, district: "", thana: "", union: "" } })}
                          />
                          <Input
                            label="District"
                            placeholder="Example: Dhaka, Coxsbazar"
                            value={profile.partnerPreferences.district}
                            onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, district: e.target.value, thana: "", union: "" } })}
                          />
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Family Type</label>
                            <select
                              value={profile.partnerPreferences.familyType}
                              onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, familyType: e.target.value } })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">Any family type</option>
                              <option value="Joint">Joint</option>
                              <option value="Nuclear">Nuclear</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Family Status</label>
                            <select
                              value={profile.partnerPreferences.familyStatus}
                              onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, familyStatus: e.target.value } })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">Any family status</option>
                              <option value="Middle Class">Middle Class</option>
                              <option value="Upper Middle Class">Upper Middle Class</option>
                              <option value="Rich">Rich</option>
                              <option value="Affluent">Affluent</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Family Values</label>
                            <select
                              value={profile.partnerPreferences.familyValues}
                              onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, familyValues: e.target.value } })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">Any family values</option>
                              <option value="Orthodox">Orthodox</option>
                              <option value="Traditional">Traditional</option>
                              <option value="Moderate">Moderate</option>
                              <option value="Liberal">Liberal</option>
                              <option value="Secular">Secular</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Button variant="gradient" size="lg" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : saved ? (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          {text("Saved!")}
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          {text("Save Changes")}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setProfile(createInitialProfile())}>
                      {text("Reset")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
