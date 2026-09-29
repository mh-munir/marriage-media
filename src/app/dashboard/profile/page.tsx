"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
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
import { registerLocationLabels, translateLocationLabel } from "@/lib/location-labels";
import { useAuthStore } from "@/stores/auth-store";
import { useLanguage } from "@/providers/language-provider";

interface ProfileFormData {
  email: string;
  mobileNumber: string;
  whatsappNumber: string;
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
  profession: string;
  institution: string;
  annualIncome: string;
  familyType: string;
  familyStatus: string;
  familyValues: string;
  fatherName: string;
  fatherProfession: string;
  guardianRelation: string;
  guardianName: string;
  guardianMobileNumber: string;
  motherName: string;
  motherProfession: string;
  numberOfSiblings: number;
  hobbies: string[];
  smoke: string;
  drink: string;
  diet: string;
  habitAnswers: Record<string, string>;
  permanentAddress: string;
  presentAddress: string;
  bloodGroup: string;
  complexion: string;
  hasMajorHealthIssue: string;
  majorHealthIssueDetails: string;
  maritalStatusDate: string;
  permanentLocation: { country: string; division: string; district: string; thana: string; union: string; area: string };
  aboutYourself: string;
  educationDetails: Array<{ level: "SSC" | "HSC" | "Graduation" | "Other"; instituteName: string; year: string }>;
  familyAwareOfBiodata: string;
  informationAccurate: string;
  truthDeclaration: string;
  acceptsFalseInformationLiability: boolean;
  siblings: Array<{ name: string; relation: "Brother" | "Sister"; profession?: string }>;
  partnerPreference: string;
  partnerPreferences: {
    age: string;
    height: string;
    weight: string;
    bloodGroup: string;
    complexion: string;
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
  whatsappNumber: "",
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
  profession: PROFESSIONS[0],
  institution: "",
  annualIncome: INCOME_RANGES[0],
  familyType: "Nuclear",
  familyStatus: "Middle Class",
  familyValues: "Moderate",
  fatherName: "",
  fatherProfession: "",
  guardianRelation: "",
  guardianName: "",
  guardianMobileNumber: "",
  motherName: "",
  motherProfession: "",
  numberOfSiblings: 0,
  hobbies: [],
  smoke: "No",
  drink: "No",
  diet: "No Preference",
  habitAnswers: {},
  permanentAddress: "",
  presentAddress: "",
  bloodGroup: "",
  complexion: "",
  hasMajorHealthIssue: "",
  majorHealthIssueDetails: "",
  maritalStatusDate: "",
  permanentLocation: { country: "Bangladesh", division: "", district: "", thana: "", union: "", area: "" },
  aboutYourself: "",
  educationDetails: ["SSC", "HSC", "Graduation", "Other"].map((level) => ({ level: level as "SSC" | "HSC" | "Graduation" | "Other", instituteName: "", year: "" })),
  familyAwareOfBiodata: "",
  informationAccurate: "",
  truthDeclaration: "",
  acceptsFalseInformationLiability: false,
  siblings: [],
  partnerPreference: "",
  partnerPreferences: {
    age: "",
    height: "",
    weight: "",
    bloodGroup: "",
    complexion: "",
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

const mergeProfileFormData = (
  profileData: Partial<ProfileFormData> | null | undefined,
  onboardingData: Partial<ProfileFormData> | null | undefined,
  mobileNumber?: string,
): ProfileFormData => {
  const base = createInitialProfile();
  const mergedProfile = {
    ...base,
    ...(profileData || {}),
    ...(onboardingData || {}),
    email: profileData?.email || onboardingData?.email || base.email,
    mobileNumber: mobileNumber || profileData?.mobileNumber || onboardingData?.mobileNumber || base.mobileNumber,
    whatsappNumber: profileData?.whatsappNumber || onboardingData?.whatsappNumber || base.whatsappNumber,
    firstName: profileData?.firstName || onboardingData?.firstName || base.firstName,
    lastName: profileData?.lastName || onboardingData?.lastName || base.lastName,
    gender: profileData?.gender || onboardingData?.gender || base.gender,
    dateOfBirth: formatDateForInput(profileData?.dateOfBirth || onboardingData?.dateOfBirth),
    profession: profileData?.profession || onboardingData?.profession || base.profession,
    institution: profileData?.institution || onboardingData?.institution || base.institution,
    hasMajorHealthIssue: profileData?.hasMajorHealthIssue || onboardingData?.hasMajorHealthIssue || base.hasMajorHealthIssue,
    majorHealthIssueDetails: profileData?.majorHealthIssueDetails || onboardingData?.majorHealthIssueDetails || base.majorHealthIssueDetails,
    maritalStatusDate: formatDateForInput(profileData?.maritalStatusDate || onboardingData?.maritalStatusDate),
    habitAnswers: {
      ...base.habitAnswers,
      ...(onboardingData?.habitAnswers || {}),
      ...(profileData?.habitAnswers || {}),
    },
    partnerPreferences: {
      ...base.partnerPreferences,
      ...(onboardingData?.partnerPreferences || {}),
      ...(profileData?.partnerPreferences || {}),
      country: profileData?.partnerPreferences?.country || onboardingData?.partnerPreferences?.country || base.partnerPreferences.country,
    },
    permanentLocation: {
      ...base.permanentLocation,
      ...(onboardingData?.permanentLocation || {}),
      ...(profileData?.permanentLocation || {}),
    },
    educationDetails: Array.isArray(profileData?.educationDetails) && profileData.educationDetails.length
      ? profileData.educationDetails
      : Array.isArray(onboardingData?.educationDetails) && onboardingData.educationDetails.length
        ? onboardingData.educationDetails
        : base.educationDetails,
    photos: Array.isArray(profileData?.photos) ? profileData.photos : Array.isArray(onboardingData?.photos) ? onboardingData.photos : base.photos,
    siblings: Array.isArray(profileData?.siblings) ? profileData.siblings : Array.isArray(onboardingData?.siblings) ? onboardingData.siblings : base.siblings,
    hobbies: Array.isArray(profileData?.hobbies) ? profileData.hobbies : Array.isArray(onboardingData?.hobbies) ? onboardingData.hobbies : base.hobbies,
  };

  return {
    ...base,
    ...mergedProfile,
    partnerPreferences: {
      ...base.partnerPreferences,
      ...mergedProfile.partnerPreferences,
      country: mergedProfile.partnerPreferences.country || "Bangladesh",
    },
    permanentLocation: {
      ...base.permanentLocation,
      ...mergedProfile.permanentLocation,
    },
  };
};

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

const locationOptionsCache = new Map<string, string[]>();

async function fetchLocationOptions(level: LocationLevel, params: Record<string, string> = {}) {
  const query = new URLSearchParams({ level, ...params });
  const cacheKey = `${level}:${query.toString()}`;
  const cached = locationOptionsCache.get(cacheKey);
  if (cached) return cached;

  const response = await fetch(`/api/locations?${query.toString()}`, { cache: "force-cache" });
  if (!response.ok) throw new Error("Unable to load location options.");
  const data = (await response.json()) as { options?: string[]; labels?: Record<string, string> };
  registerLocationLabels(data.labels || {});
  const options = data.options || [];
  locationOptionsCache.set(cacheKey, options);
  return options;
}

export default function DashboardProfilePage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("all");
  const [error, setError] = React.useState("");
  const [profileExists, setProfileExists] = React.useState(false);
  const [profile, setProfile] = React.useState<ProfileFormData>(createInitialProfile());
  const [locationOptions, setLocationOptions] = React.useState<LocationOptions>(emptyLocationOptions);
  const [permanentLocationOptions, setPermanentLocationOptions] = React.useState<LocationOptions>(emptyLocationOptions);
  const [professionOptions, setProfessionOptions] = React.useState<Array<{ value: string; label: string }>>([]);
  const { updateUser } = useAuthStore();
  const { language, translateText: text } = useLanguage();

  React.useEffect(() => {
    async function loadProfessionOptions() {
      try {
        const response = await fetch(`/api/options/professions?lang=${language === "bn" ? "bn" : "en"}`, { cache: "no-store" });
        const data = await response.json();
        setProfessionOptions(data.options || []);
      } catch {
        setProfessionOptions([]);
      }
    }

    void loadProfessionOptions();
  }, [language]);

  React.useEffect(() => {
    void fetchLocationOptions("divisions").then((divisions) => {
      setLocationOptions((current) => ({ ...current, divisions }));
      setPermanentLocationOptions((current) => ({ ...current, divisions }));
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
    let active = true;
    const { division, district, thana } = profile.permanentLocation;
    if (!division) {
      void Promise.resolve().then(() => {
        if (active) setPermanentLocationOptions((current) => ({ ...current, districts: [], thanas: [], unions: [] }));
      });
      return () => { active = false; };
    }
    void fetchLocationOptions("districts", { division }).then((districts) => {
      if (active) setPermanentLocationOptions((current) => ({ ...current, districts, thanas: [], unions: [] }));
    });
    if (!district) return () => { active = false; };
    void fetchLocationOptions("thanas", { division, district }).then((thanas) => {
      if (active) setPermanentLocationOptions((current) => ({ ...current, thanas, unions: [] }));
    });
    if (!thana) return () => { active = false; };
    void fetchLocationOptions("unions", { division, district, thana }).then((unions) => {
      if (active) setPermanentLocationOptions((current) => ({ ...current, unions }));
    });
    return () => { active = false; };
  }, [profile.permanentLocation]);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await apiClient.get<{ profile?: Partial<ProfileFormData>; mobileNumber?: string; whatsappNumber?: string; onboarding?: Partial<ProfileFormData> }>('/api/profile');
        const profileData = response.profile;

        if (profileData) {
          setProfile(
            mergeProfileFormData(profileData as Partial<ProfileFormData>, response.onboarding as Partial<ProfileFormData>, response.mobileNumber || "")
          );
          updateUser({
            avatar: profileData.photos?.find((photo) => photo.isPrimary)?.url || "",
          });
          setProfileExists(true);
        } else {
          setProfile(
            mergeProfileFormData(null, response.onboarding as Partial<ProfileFormData>, response.mobileNumber || "")
          );
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
      { value: profile.bloodGroup, label: "Blood Group" },
      { value: profile.complexion, label: "Complexion" },
      { value: profile.hasMajorHealthIssue, label: "Health condition answer" },
      { value: profile.maritalStatus, label: "Marital Status" },
      { value: profile.religion, label: "Religion" },
      { value: profile.motherTongue, label: "Mother Tongue" },
      { value: profile.country, label: "Country" },
      { value: profile.division, label: "Division" },
      { value: profile.district, label: "District" },
    ];
    const missingFields = requiredFields
      .filter(({ value }) => !String(value || "").trim())
      .map(({ label }) => label);

    if (profile.hasMajorHealthIssue === "Yes" && !profile.majorHealthIssueDetails.trim()) {
      missingFields.push("Physical problem or major illness details");
    }

    if (!Object.values(profile.partnerPreferences).some((value) => String(value || "").trim())) {
      missingFields.push("At least one Expected Partner preference");
    }
    if (profile.photos.length < 1) missingFields.push("At least 1 profile photo");
    return missingFields;
  };

  const handleSave = async () => {
    if (isSaving) return;

    const missingFields = getMissingRequiredFields();
    if (missingFields.length) {
      setError(`Please complete these fields before saving: ${missingFields.join(", ")}.`);
      setActiveSection("all");
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
      await apiClient.patch('/api/auth/onboarding', { data: payload, sync: true });

      const savedProfile = response.profile;
      setProfile(
        mergeProfileFormData(savedProfile as Partial<ProfileFormData>, {} as Partial<ProfileFormData>, profile.mobileNumber)
      );
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
            {text("Back to Dashboard")}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-2xl"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{text("Your profile workspace")}</p>
            <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">{text("Your Profile")}</h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              {text("Manage your profile information and preferences.")}
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
                      {profile.isPremium ? text("Premium") : text("Free Plan")}
                    </Badge>
                    {profile.isVerified ? (
                      <Badge variant="outline" className="text-xs text-emerald-600">
                        <Sparkles className="mr-1 h-3 w-3" />
                        {text("Verified")}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{text("Complete your profile to get better matches.")}</p>
                  <div className="flex max-w-md items-center gap-3">
                    <Progress value={profileCompletion} className="h-2 flex-1" />
                    <span className="text-xs font-semibold tabular-nums text-primary">{profileCompletion}%</span>
                  </div>
                </div>
                {!profile.isPremium ? (
                  <Button variant="gradient" size="sm" asChild>
                    <Link href="/pricing">{text("Upgrade to Premium")}</Link>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="min-w-0">
              {isLoading ? (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">
                    <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
                    Loading your profile...
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-5">
                  {(activeSection === "all" || activeSection === "basic") && (
                    <Card id="basic">
                      <CardHeader>
                        <CardTitle>{text("Complete Your Profile")}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        <div className="space-y-4">
                          <h2 className="text-lg font-semibold">{text("Basic Information")}</h2>

                          {profile.photos.length > 0 ? (
                            <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-5">
                              {profile.photos.map((photo) => (
                                <div
                                  key={photo.publicId}
                                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted shadow-sm"
                                >
                                  <Image src={photo.url} alt="Profile" fill sizes="(min-width: 640px) 16vw, 50vw" className="object-cover" />
                                  {photo.isPrimary ? <Badge className="absolute bottom-2 left-2">Primary</Badge> : null}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <section>
                          <h2 className="mb-4 text-lg font-semibold">{text("Basic Information")}</h2>
                          <div className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
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

                            <div className="grid gap-4 md:grid-cols-2">
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
                                inputMode="numeric"
                                pattern="01[3-9][0-9]{8}"
                                maxLength={11}
                                value={profile.mobileNumber}
                                readOnly
                                placeholder="Registered mobile number"
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <Input
                                label={text("WhatsApp/Imo Number")}
                                type="tel"
                                inputMode="numeric"
                                value={profile.whatsappNumber}
                                onChange={(e) => setProfile({ ...profile, whatsappNumber: `+88${sanitizePhoneNumberInput(e.target.value).replace(/^88/, "").slice(0, 11)}` })}
                              />
                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Blood Group")}</label>
                                <select value={profile.bloodGroup} onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })} className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition focus:border-primary">
                                  <option value="">{text("Select blood group")}</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => <option key={group} value={group}>{group}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Complexion")}</label>
                                <select value={profile.complexion} onChange={(e) => setProfile({ ...profile, complexion: e.target.value })} className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition focus:border-primary">
                                  <option value="">{text("Select")}</option>{["Fair", "Bright", "Wheatish", "Dusky", "Dark"].map((value) => <option key={value} value={value}>{text(value)}</option>)}
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <p className="mb-2 text-sm font-medium text-foreground">{text("Do you have any physical problem or major illness?")}</p>
                                <div className="flex gap-5 text-sm">
                                  {["Yes", "No"].map((answer) => (
                                    <label className="flex items-center gap-1" key={answer}>
                                      <input type="radio" name="profile-health-condition" checked={profile.hasMajorHealthIssue === answer} onChange={() => setProfile({ ...profile, hasMajorHealthIssue: answer, majorHealthIssueDetails: answer === "No" ? "" : profile.majorHealthIssueDetails })} />
                                      {text(answer)}
                                    </label>
                                  ))}
                                </div>
                                {profile.hasMajorHealthIssue === "Yes" ? <Input label={text("Please specify the physical problem or illness")} value={profile.majorHealthIssueDetails} onChange={(e) => setProfile({ ...profile, majorHealthIssueDetails: e.target.value })} /> : null}
                              </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-3">
                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Gender")}</label>
                                <select
                                  value={profile.gender}
                                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition focus:border-primary"
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

                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Marital Status")}</label>
                                <select
                                  value={profile.maritalStatus}
                                  onChange={(e) => setProfile({ ...profile, maritalStatus: e.target.value })}
                                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition focus:border-primary"
                                >
                                  <option value="Never Married">{text("Never Married")}</option>
                                  <option value="Divorced">{text("Divorced")}</option>
                                  <option value="Widowed">{text("Widowed")}</option>
                                  <option value="Awaiting Divorce">{text("Awaiting Divorce")}</option>
                                </select>
                              </div>
                              {["Divorced", "Awaiting Divorce"].includes(profile.maritalStatus) ? (
                                <div className="space-y-1.5">
                                  <label className="text-sm font-medium text-foreground">{text("Separation/Divorce Date")}</label>
                                  <DatePicker value={profile.maritalStatusDate} onChange={(maritalStatusDate) => setProfile({ ...profile, maritalStatusDate })} placeholder={text("Select separation/divorce date")} />
                                </div>
                              ) : null}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Religion")}</label>
                                <select
                                  value={profile.religion}
                                  onChange={(e) => setProfile({ ...profile, religion: e.target.value })}
                                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition focus:border-primary"
                                >
                                  {RELIGIONS.map((r) => (
                                    <option key={r} value={r}>{text(r)}</option>
                                  ))}
                                </select>
                              </div>

                              <Input
                                label={text("Mother Tongue")}
                                value={profile.motherTongue}
                                onChange={(e) => setProfile({ ...profile, motherTongue: e.target.value })}
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Height")}</label>
                                <select
                                  value={profile.height}
                                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition focus:border-primary"
                                >
                                  {HEIGHTS.map((h) => (
                                    <option key={h} value={h}>{text(h)}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Weight")}</label>
                                <select
                                  value={profile.weight}
                                  onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition focus:border-primary"
                                >
                                  {WEIGHTS.map((w) => (
                                    <option key={w} value={w}>{text(w)}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </section>

                        <section id="family">
                          <h2 className="mb-4 text-lg font-semibold">{text("Family Information")}</h2>
                          <div className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-3">
                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Guardian")}</label>
                                <select value={profile.guardianRelation} onChange={(e) => setProfile({ ...profile, guardianRelation: e.target.value })} className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition focus:border-primary">
                                  <option value="">{text("Select")}</option><option value="Father">{text("Father")}</option><option value="Mother">{text("Mother")}</option><option value="Brother">{text("Brother")}</option><option value="Sister">{text("Sister")}</option>
                                </select>
                              </div>
                              <Input label={text("Guardian Name")} value={profile.guardianName} onChange={(e) => setProfile({ ...profile, guardianName: e.target.value })} />
                              <Input label={text("Guardian Mobile Number")} type="tel" inputMode="numeric" pattern="01[3-9][0-9]{8}" maxLength={11} value={profile.guardianMobileNumber} onChange={(e) => setProfile({ ...profile, guardianMobileNumber: sanitizePhoneNumberInput(e.target.value).slice(0, 11) })} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <Input
                                label={text("Father's Name")}
                                value={profile.fatherName}
                                onChange={(e) => setProfile({ ...profile, fatherName: e.target.value })}
                              />
                              <Input label={text("Father's Profession")} value={profile.fatherProfession} onChange={(e) => setProfile({ ...profile, fatherProfession: e.target.value })} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <Input
                                label={text("Mother's Name")}
                                value={profile.motherName}
                                onChange={(e) => setProfile({ ...profile, motherName: e.target.value })}
                              />
                              <Input label={text("Mother's Profession")} value={profile.motherProfession} onChange={(e) => setProfile({ ...profile, motherProfession: e.target.value })} />
                            </div>

                            <Input label={text("Brothers and Sisters")} type="number" min={0} max={20} value={profile.numberOfSiblings} onChange={(e) => setProfile({ ...profile, numberOfSiblings: Math.min(20, Math.max(0, Number.parseInt(e.target.value, 10) || 0)) })} />

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Family Type")}</label>
                                <select
                                  value={profile.familyType}
                                  onChange={(e) => setProfile({ ...profile, familyType: e.target.value })}
                                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition focus:border-primary"
                                >
                                  <option value="Joint">{text("Joint")}</option>
                                  <option value="Nuclear">{text("Nuclear")}</option>
                                </select>
                              </div>
                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Family Status")}</label>
                                <select
                                  value={profile.familyStatus}
                                  onChange={(e) => setProfile({ ...profile, familyStatus: e.target.value })}
                                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition focus:border-primary"
                                >
                                  <option value="Middle Class">{text("Middle Class")}</option>
                                  <option value="Upper Middle Class">{text("Upper Middle Class")}</option>
                                  <option value="Rich">{text("Rich")}</option>
                                  <option value="Affluent">{text("Affluent")}</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Family Values")}</label>
                              <select
                                value={profile.familyValues}
                                onChange={(e) => setProfile({ ...profile, familyValues: e.target.value })}
                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition focus:border-primary"
                              >
                                <option value="Orthodox">{text("Orthodox")}</option>
                                <option value="Traditional">{text("Traditional")}</option>
                                <option value="Moderate">{text("Moderate")}</option>
                                <option value="Liberal">{text("Liberal")}</option>
                                <option value="Secular">{text("Secular")}</option>
                              </select>
                            </div>

                            <div className="space-y-3">
                              <label className="text-sm font-medium text-foreground">{text("Brothers and Sisters")}</label>

                              {profile.siblings.length ? (
                                profile.siblings.map((sibling, index) => (
                                  <div key={`sibling-${index}`} className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
                                    <Input
                                      label={`${index + 1}. ${text(sibling.relation)} ${text("Name")}`}
                                      value={sibling.name}
                                      onChange={(e) =>
                                        setProfile({
                                          ...profile,
                                          siblings: profile.siblings.map((item, itemIndex) =>
                                            itemIndex === index ? { ...item, name: e.target.value } : item
                                          ),
                                        })
                                      }
                                    />

                                    <Input
                                      label={text("Profession / Occupation")}
                                      value={sibling.profession || ""}
                                      onChange={(e) =>
                                        setProfile({
                                          ...profile,
                                          siblings: profile.siblings.map((item, itemIndex) =>
                                            itemIndex === index ? { ...item, profession: e.target.value } : item
                                          ),
                                        })
                                      }
                                    />
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">{text("No brothers or sisters added.")}</p>
                              )}
                            </div>
                          </div>
                        </section>

                        <section id="location">
                          <h2 className="mb-4 text-lg font-semibold">{text("Location Information")}</h2>
                          <div className="space-y-4">
                        <h3 className="text-lg font-semibold">{text("Present Address")}</h3>
                        <Input
                          label={text("Country")}
                          value={translateLocationLabel(profile.country, language)}
                          onChange={(e) => setProfile({ ...profile, country: e.target.value === "বাংলাদেশ" ? "Bangladesh" : e.target.value })}
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
                                <option key={d} value={d}>{translateLocationLabel(d, language)}</option>
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
                                <option key={district} value={district}>{translateLocationLabel(district, language)}</option>
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
                                <option key={thana} value={thana}>{translateLocationLabel(thana, language)}</option>
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
                                <option key={union} value={union}>{translateLocationLabel(union, language)}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <Input
                          label="Area"
                          value={profile.area}
                          onChange={(e) => setProfile({ ...profile, area: e.target.value })}
                        />
                        <div className="space-y-4 border-t border-border pt-4">
                          <h3 className="text-lg font-semibold">{text("Permanent Address")}</h3>
                          <Input
                            label={text("Country")}
                            value={translateLocationLabel(profile.permanentLocation.country, language)}
                            onChange={(e) => setProfile({ ...profile, permanentLocation: { ...profile.permanentLocation, country: e.target.value === "বাংলাদেশ" ? "Bangladesh" : e.target.value } })}
                          />
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1.5">{text("Division")}</label>
                              <select
                                value={profile.permanentLocation.division}
                                onChange={(e) => setProfile({ ...profile, permanentLocation: { ...profile.permanentLocation, division: e.target.value, district: "", thana: "", union: "" } })}
                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                              >
                                <option value="">{text("Select division")}</option>
                                {permanentLocationOptions.divisions.map((division) => <option key={division} value={division}>{translateLocationLabel(division, language)}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1.5">{text("District")}</label>
                              <select
                                value={profile.permanentLocation.district}
                                onChange={(e) => setProfile({ ...profile, permanentLocation: { ...profile.permanentLocation, district: e.target.value, thana: "", union: "" } })}
                                disabled={!profile.permanentLocation.division}
                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <option value="">{text(profile.permanentLocation.division ? "Select district" : "Select division first")}</option>
                                {permanentLocationOptions.districts.map((district) => <option key={district} value={district}>{translateLocationLabel(district, language)}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1.5">{text("Thana")}</label>
                              <select
                                value={profile.permanentLocation.thana}
                                onChange={(e) => setProfile({ ...profile, permanentLocation: { ...profile.permanentLocation, thana: e.target.value, union: "" } })}
                                disabled={!profile.permanentLocation.district}
                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <option value="">{text(profile.permanentLocation.district ? "Select thana" : "Select district first")}</option>
                                {permanentLocationOptions.thanas.map((thana) => <option key={thana} value={thana}>{translateLocationLabel(thana, language)}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1.5">{text("Union")}</label>
                              <select
                                value={profile.permanentLocation.union}
                                onChange={(e) => setProfile({ ...profile, permanentLocation: { ...profile.permanentLocation, union: e.target.value } })}
                                disabled={!profile.permanentLocation.thana}
                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <option value="">{text(profile.permanentLocation.thana ? "Select union" : "Select thana first")}</option>
                                {permanentLocationOptions.unions.map((union) => <option key={union} value={union}>{translateLocationLabel(union, language)}</option>)}
                              </select>
                            </div>
                          </div>
                          <Input
                            label={text("Area")}
                            value={profile.permanentLocation.area}
                            onChange={(e) => setProfile({ ...profile, permanentLocation: { ...profile.permanentLocation, area: e.target.value } })}
                          />
                        </div>
                          </div>
                        </section>

                        <section id="education">
                          <h2 className="mb-4 text-lg font-semibold">{text("Education & Career")}</h2>
                          <div className="space-y-5">
                            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
                              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{text("Profession")}</p>
                              <p className="text-base font-medium text-foreground">
                                {profile.profession || text("Not added")}
                              </p>
                            </div>
                            <Input
                              label={text("Institution/Organization Name")}
                              value={profile.institution}
                              onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                            />

                            <div>
                              <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Annual Income")}</label>
                              <select
                                value={profile.annualIncome}
                                onChange={(e) => setProfile({ ...profile, annualIncome: e.target.value })}
                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition focus:border-primary"
                              >
                                {INCOME_RANGES.map((i) => (
                                  <option key={i} value={i}>{text(i)}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-3">
                              <label className="block text-sm font-medium text-foreground">{text("Education Details")}</label>
                              {profile.educationDetails.map((education, index) => (
                                <div className="grid gap-3 md:grid-cols-[140px_1fr_120px]" key={education.level}>
                                  <p className="self-center text-sm font-medium">{education.level}</p>
                                  <Input label="Institute Name" value={education.instituteName} onChange={(e) => setProfile({ ...profile, educationDetails: profile.educationDetails.map((item, itemIndex) => itemIndex === index ? { ...item, instituteName: e.target.value } : item) })} />
                                  <Input label="Year" value={education.year} onChange={(e) => setProfile({ ...profile, educationDetails: profile.educationDetails.map((item, itemIndex) => itemIndex === index ? { ...item, year: e.target.value } : item) })} />
                                </div>
                              ))}
                            </div>

                            <div id="about-me">
                              <label className="mb-1.5 block text-sm font-medium text-foreground">{text("About Me")}</label>
                              <textarea className="min-h-28 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm transition focus:border-primary" value={profile.aboutYourself} onChange={(e) => setProfile({ ...profile, aboutYourself: e.target.value })} />
                            </div>

                            <fieldset className="rounded-xl border border-border bg-muted/20 p-4">
                              <legend className="px-1 text-sm font-medium">{text("Your habits")}</legend>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {["Exercise", "Reading", "Travel", "Cooking"].map((habit) => (
                                  <div className="rounded-lg border border-border bg-background p-3" key={habit}>
                                    <p className="mb-2 text-sm font-medium">{text(habit)}</p>
                                    <div className="flex gap-4 text-sm">
                                      {["Yes", "No"].map((answer) => (
                                        <label className="flex items-center gap-1" key={answer}>
                                          <input type="radio" name={`dashboard-habit-${habit}`} checked={profile.habitAnswers[habit] === answer} onChange={() => setProfile({ ...profile, habitAnswers: { ...profile.habitAnswers, [habit]: answer } })} />
                                          {text(answer)}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </fieldset>
                          </div>
                        </section>

                      </CardContent>
                    </Card>
                  )}

                  {(activeSection === "all" || activeSection === "expected-partner") && (
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
                            <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Blood Group")}</label>
                            <select value={profile.partnerPreferences.bloodGroup} onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, bloodGroup: e.target.value } })} className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm">
                              <option value="">{text("Any")}</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => <option key={group} value={group}>{group}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Complexion")}</label>
                            <select value={profile.partnerPreferences.complexion} onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, complexion: e.target.value } })} className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm">
                              <option value="">{text("Any")}</option>{["Fair", "Bright", "Wheatish", "Dusky", "Dark"].map((value) => <option key={value} value={value}>{text(value)}</option>)}
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
                            <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Highest Education")}</label>
                            <select
                              value={profile.partnerPreferences.highestEducation}
                              onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, highestEducation: e.target.value } })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">{text("Any education")}</option>
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
                            placeholder={text("Example: Dhaka, Cox's Bazar")}
                            value={profile.partnerPreferences.district}
                            onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, district: e.target.value, thana: "", union: "" } })}
                          />
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Family Type")}</label>
                            <select
                              value={profile.partnerPreferences.familyType}
                              onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, familyType: e.target.value } })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">{text("Any")}</option>
                              <option value="Joint">{text("Joint")}</option>
                              <option value="Nuclear">{text("Nuclear")}</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Family Status")}</label>
                            <select
                              value={profile.partnerPreferences.familyStatus}
                              onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, familyStatus: e.target.value } })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">{text("Any")}</option>
                              <option value="Middle Class">{text("Middle Class")}</option>
                              <option value="Upper Middle Class">{text("Upper Middle Class")}</option>
                              <option value="Rich">{text("Rich")}</option>
                              <option value="Affluent">{text("Affluent")}</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">{text("Family Values")}</label>
                            <select
                              value={profile.partnerPreferences.familyValues}
                              onChange={(e) => setProfile({ ...profile, partnerPreferences: { ...profile.partnerPreferences, familyValues: e.target.value } })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="">{text("Any")}</option>
                              <option value="Orthodox">{text("Orthodox")}</option>
                              <option value="Traditional">{text("Traditional")}</option>
                              <option value="Moderate">{text("Moderate")}</option>
                              <option value="Liberal">{text("Liberal")}</option>
                              <option value="Secular">{text("Secular")}</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </div>
                  )}

                  <section className="rounded-xl border p-4 space-y-3">
                    <h2 className="text-lg font-semibold">{text("Declarations")}</h2>
                    {[["familyAwareOfBiodata", "My family knows that I am submitting this biodata."], ["informationAccurate", "I confirm before Allah that all information is accurate."], ["truthDeclaration", "I declare before Allah that all information is accurate."]].map(([key, label]) => <div key={key}><p className="text-sm font-medium">{text(label)}</p><label className="mr-4 text-sm"><input className="mr-1" type="radio" checked={profile[key as keyof ProfileFormData] === "Yes"} onChange={() => setProfile({ ...profile, [key]: "Yes" })} />{text("Yes")}</label><label className="text-sm"><input className="mr-1" type="radio" checked={profile[key as keyof ProfileFormData] === "No"} onChange={() => setProfile({ ...profile, [key]: "No" })} />{text("No")}</label></div>)}
                    <label className="flex gap-2 text-sm"><input type="checkbox" checked={profile.acceptsFalseInformationLiability} onChange={(e) => setProfile({ ...profile, acceptsFalseInformationLiability: e.target.checked })} />{text("I accept legal and religious responsibility for false information.")}</label>
                  </section>
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
                  </div>
                </div>
              )}
            </div>
          </div>
      </main>
      <Footer />
    </div>
  );
}
