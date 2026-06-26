"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  Shield,
  Eye,
  EyeOff,
  Globe,
  Heart,
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

export default function DashboardProfilePage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("basic");

  const profileCompletion = 65;

  const [profile, setProfile] = React.useState({
    firstName: "John",
    lastName: "Doe",
    gender: "Male",
    dateOfBirth: "1995-06-15",
    height: "5'8\" (173 cm)",
    weight: "70-80 kg",
    maritalStatus: "Never Married",
    religion: "Islam",
    motherTongue: "Bengali",
    country: "Bangladesh",
    division: "Dhaka",
    district: "Dhaka",
    area: "Gulshan",
    highestEducation: "Bachelor's Degree",
    institution: "University of Dhaka",
    profession: "Engineer",
    company: "Tech Corp",
    annualIncome: "BDT 50,000 - 75,000",
    familyType: "Nuclear",
    familyStatus: "Middle Class",
    familyValues: "Moderate",
    aboutMe: "I am a software engineer who values family and tradition. Looking for a life partner who shares similar values.",
    partnerPreference: "Looking for someone who is educated, family-oriented, and shares similar cultural values.",
    showContactInfo: false,
    isVisible: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sections = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "location", label: "Location", icon: Globe },
    { id: "education", label: "Education", icon: Shield },
    { id: "family", label: "Family", icon: Heart },
    { id: "about", label: "About", icon: User },
    { id: "settings", label: "Settings", icon: Eye },
  ];

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

          {/* Profile Completion */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{profile.firstName} {profile.lastName}</h3>
                    <Badge variant="outline" className="text-xs">Free Plan</Badge>
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
            {/* Sidebar Navigation */}
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

            {/* Form Content */}
            <div className="lg:col-span-3">
              {/* Basic Info */}
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

              {/* Location */}
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

              {/* Education */}
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

              {/* Family */}
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

              {/* About */}
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

              {/* Settings */}
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

              {/* Save Button */}
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
                <Button variant="outline" size="lg">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}