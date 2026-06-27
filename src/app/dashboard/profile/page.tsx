"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Save,
  Loader2,
  CheckCircle,
  Shield,
  Eye,
  Globe,
  Heart,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  RELIGIONS,
  EDUCATION_LEVELS,
  PROFESSIONS,
  BANGLADESH_DIVISIONS,
  HEIGHTS,
  WEIGHTS,
  INCOME_RANGES,
} from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

interface ProfileFormData {
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
  area: string;
  highestEducation: string;
  institution: string;
  profession: string;
  company: string;
  annualIncome: string;
  familyType: string;
  familyStatus: string;
  familyValues: string;
  aboutMe: string;
  partnerPreference: string;
  showContactInfo: boolean;
  isVisible: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
}

const createInitialProfile = (): ProfileFormData => ({
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
  division: BANGLADESH_DIVISIONS[0],
  district: "",
  area: "",
  highestEducation: EDUCATION_LEVELS[0],
  institution: "",
  profession: PROFESSIONS[0],
  company: "",
  annualIncome: INCOME_RANGES[0],
  familyType: "Nuclear",
  familyStatus: "Middle Class",
  familyValues: "Moderate",
  aboutMe: "",
  partnerPreference: "",
  showContactInfo: false,
  isVisible: true,
  isPremium: false,
  isVerified: false,
});

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

export default function DashboardProfilePage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("basic");
  const [error, setError] = React.useState("");
  const [profileExists, setProfileExists] = React.useState(false);
  const [profile, setProfile] = React.useState<ProfileFormData>(createInitialProfile());
  const { user, updateUser } = useAuthStore();

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await apiClient.get<{ profile?: Partial<ProfileFormData> }>('/api/profile');
        const profileData = response.profile;

        if (profileData) {
          setProfile({
            ...createInitialProfile(),
            ...profileData,
            dateOfBirth: formatDateForInput(profileData.dateOfBirth),
          });
          setProfileExists(true);
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
  }, []);

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
      profile.aboutMe,
      profile.partnerPreference,
    ];

    const completedFields = completionFields.filter((value) => Boolean(value && String(value).trim())).length;
    return Math.round((completedFields / completionFields.length) * 100);
  }, [profile]);

  const handleSave = async () => {
    if (isSaving) return;

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
        dateOfBirth: formatDateForInput(savedProfile.dateOfBirth),
      });
      setProfileExists(true);
      updateUser({
        firstName: savedProfile.firstName,
        lastName: savedProfile.lastName,
        profileCompleted: profileCompletion,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "location", label: "Location", icon: Globe },
    { id: "education", label: "Education", icon: Shield },
    { id: "family", label: "Family", icon: Heart },
    { id: "about", label: "About", icon: User },
    { id: "settings", label: "Settings", icon: Eye },
  ];

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your Profile";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile information and preferences.
            </p>
          </motion.div>

          {error ? (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
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
                  <div className="flex items-center gap-3">
                    <Progress value={profileCompletion} className="flex-1 max-w-xs" />
                    <span className="text-sm font-medium">{profileCompletion}%</span>
                  </div>
                </div>
                <Button variant="gradient" size="sm" asChild>
                  <Link href="/pricing">Upgrade to Premium</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-3">
                  <nav className="space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          activeSection === section.id
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
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

            <div className="lg:col-span-3">
              {isLoading ? (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">
                    <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
                    Loading your profile...
                  </CardContent>
                </Card>
              ) : (
                <>
                  {activeSection === "basic" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
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
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
                            <select
                              value={profile.gender}
                              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                          <Input
                            label="Date of Birth"
                            type="date"
                            value={profile.dateOfBirth}
                            onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Height</label>
                            <select
                              value={profile.height}
                              onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              {HEIGHTS.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Weight</label>
                            <select
                              value={profile.weight}
                              onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              {WEIGHTS.map((w) => (
                                <option key={w} value={w}>{w}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Marital Status</label>
                            <select
                              value={profile.maritalStatus}
                              onChange={(e) => setProfile({ ...profile, maritalStatus: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="Never Married">Never Married</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                              <option value="Awaiting Divorce">Awaiting Divorce</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Religion</label>
                            <select
                              value={profile.religion}
                              onChange={(e) => setProfile({ ...profile, religion: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              {RELIGIONS.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === "location" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Location Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Input
                          label="Country"
                          value={profile.country}
                          onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                        />
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Division</label>
                            <select
                              value={profile.division}
                              onChange={(e) => setProfile({ ...profile, division: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              {BANGLADESH_DIVISIONS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <Input
                            label="District"
                            value={profile.district}
                            onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                          />
                        </div>
                        <Input
                          label="Area"
                          value={profile.area}
                          onChange={(e) => setProfile({ ...profile, area: e.target.value })}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === "education" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Education & Career</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Highest Education</label>
                          <select
                            value={profile.highestEducation}
                            onChange={(e) => setProfile({ ...profile, highestEducation: e.target.value })}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                          >
                            {EDUCATION_LEVELS.map((e) => (
                              <option key={e} value={e}>{e}</option>
                            ))}
                          </select>
                        </div>
                        <Input
                          label="Institution"
                          value={profile.institution}
                          onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                        />
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Profession</label>
                          <select
                            value={profile.profession}
                            onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                          >
                            {PROFESSIONS.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                        <Input
                          label="Company"
                          value={profile.company}
                          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        />
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Annual Income</label>
                          <select
                            value={profile.annualIncome}
                            onChange={(e) => setProfile({ ...profile, annualIncome: e.target.value })}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                          >
                            {INCOME_RANGES.map((i) => (
                              <option key={i} value={i}>{i}</option>
                            ))}
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === "family" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Family Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Family Type</label>
                            <select
                              value={profile.familyType}
                              onChange={(e) => setProfile({ ...profile, familyType: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="Joint">Joint</option>
                              <option value="Nuclear">Nuclear</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Family Status</label>
                            <select
                              value={profile.familyStatus}
                              onChange={(e) => setProfile({ ...profile, familyStatus: e.target.value })}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            >
                              <option value="Middle Class">Middle Class</option>
                              <option value="Upper Middle Class">Upper Middle Class</option>
                              <option value="Rich">Rich</option>
                              <option value="Affluent">Affluent</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Family Values</label>
                          <select
                            value={profile.familyValues}
                            onChange={(e) => setProfile({ ...profile, familyValues: e.target.value })}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                          >
                            <option value="Orthodox">Orthodox</option>
                            <option value="Traditional">Traditional</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Liberal">Liberal</option>
                            <option value="Secular">Secular</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === "about" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>About You</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea
                          label="About Me"
                          value={profile.aboutMe}
                          onChange={(e) => setProfile({ ...profile, aboutMe: e.target.value })}
                          rows={5}
                          placeholder="Tell others about yourself..."
                        />
                        <Textarea
                          label="Partner Preference"
                          value={profile.partnerPreference}
                          onChange={(e) => setProfile({ ...profile, partnerPreference: e.target.value })}
                          rows={4}
                          placeholder="Describe your ideal partner..."
                        />
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === "settings" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                          <div className="flex items-center gap-3">
                            <Eye className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <h3 className="font-medium text-sm">Public Profile</h3>
                              <p className="text-xs text-muted-foreground">Make your profile visible to others</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setProfile({ ...profile, isVisible: !profile.isVisible })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              profile.isVisible ? "bg-primary" : "bg-muted"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                profile.isVisible ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <h3 className="font-medium text-sm">Show Contact Info</h3>
                              <p className="text-xs text-muted-foreground">Allow others to see your contact details</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setProfile({ ...profile, showContactInfo: !profile.showContactInfo })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              profile.showContactInfo ? "bg-primary" : "bg-muted"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                profile.showContactInfo ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="mt-6 flex items-center gap-3">
                    <Button variant="gradient" size="lg" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : saved ? (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setProfile(createInitialProfile())}>
                      Reset
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}