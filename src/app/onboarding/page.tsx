"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  EDUCATION_LEVELS,
  HEIGHTS,
  RELIGIONS,
  WEIGHTS,
} from "@/lib/utils";
import {
  registerLocationLabels,
  translateLocationLabel,
} from "@/lib/location-labels";
import { useLanguage } from "@/providers/language-provider";
import { apiClient } from "@/lib/api-client";

type D = Record<string, any>;
const titles = [
  "Basic Information",
  "Family Information",
  "Location Information",
  "Education",
  "About Me",
  "Images",
  "Expected Partner",
  "Confirmation",
];
function StepTracker({ current }: { current: number }) {
  return (
    <nav
      className="onboarding-step-tracker"
      aria-label={`Step ${current} of ${titles.length}`}
    >
      {titles.map((title, index) => {
        const number = index + 1;
        const status =
          number < current
            ? "done"
            : number === current
              ? "active"
              : "upcoming";
        return (
          <React.Fragment key={title}>
            <div
              className={`onboarding-step ${status}`}
              aria-current={status === "active" ? "step" : undefined}
            >
              <span className="onboarding-step-dot">
                {status === "done" ? <Check aria-hidden="true" /> : number}
              </span>
            </div>
            {number < titles.length ? (
              <span
                className={`onboarding-step-line ${number < current ? "done" : ""}`}
                aria-hidden="true"
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
const habitOptions = [
  "Exercise",
  "Reading",
  "Travel",
  "Cooking",
];
const partnerHeightRanges = [
  "4'10\"-5'0\"",
  "5'1\"-5'3\"",
  "5'4\"-5'6\"",
  "5'7\"-5'9\"",
  "5'10\"-6'0\"",
  "6'1\"-6'3\"",
];
const heightLabels: Record<string, string> = {
  "4'10\" (147 cm)": "৪'১০\" (১৪৭ সেমি)",
  "4'11\" (150 cm)": "৪'১১\" (১৫০ সেমি)",
  "5'0\" (152 cm)": "৫'০\" (১৫২ সেমি)",
  "5'1\" (155 cm)": "৫'১\" (১৫৫ সেমি)",
  "5'2\" (157 cm)": "৫'২\" (১৫৭ সেমি)",
  "5'3\" (160 cm)": "৫'৩\" (১৬০ সেমি)",
  "5'4\" (163 cm)": "৫'৪\" (১৬৩ সেমি)",
  "5'5\" (165 cm)": "৫'৫\" (১৬৫ সেমি)",
  "5'6\" (168 cm)": "৫'৬\" (১৬৮ সেমি)",
  "5'7\" (170 cm)": "৫'৭\" (১৭০ সেমি)",
  "5'8\" (173 cm)": "৫'৮\" (১৭৩ সেমি)",
  "5'9\" (175 cm)": "৫'৯\" (১৭৫ সেমি)",
  "5'10\" (178 cm)": "৫'১০\" (১৭৮ সেমি)",
  "5'11\" (180 cm)": "৫'১১\" (১৮০ সেমি)",
  "6'0\" (183 cm)": "৬'০\" (১৮৩ সেমি)",
  "6'1\" (185 cm)": "৬'১\" (১৮৫ সেমি)",
  "6'2\" (188 cm)": "৬'২\" (১৮৮ সেমি)",
  "6'3\" (191 cm)": "৬'৩\" (১৯১ সেমি)",
};
const partnerHeightLabels: Record<string, string> = {
  "4'10\"-5'0\"": "৪'১০\" - ৫'০\"",
  "5'1\"-5'3\"": "৫'১\" - ৫'৩\"",
  "5'4\"-5'6\"": "৫'৪\" - ৫'৬\"",
  "5'7\"-5'9\"": "৫'৭\" - ৫'৯\"",
  "5'10\"-6'0\"": "৫'১০\" - ৬'০\"",
  "6'1\"-6'3\"": "৬'১\" - ৬'৩\"",
};
const partnerAgeRanges = ["18-25", "26-30", "31-35", "36-40", "41-50", "51+"];
const requiredPartnerFields = ["religion"];
const blank: D = {
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  height: "",
  bloodGroup: "",
  complexion: "",
  hasMajorHealthIssue: "",
  majorHealthIssueDetails: "",
  maritalStatus: "Never Married",
  maritalStatusDate: "",
  childrenCount: "",
  religion: "Islam",
  institution: "",
  motherTongue: "Bengali",
  whatsappNumber: "",
  email: "",
  country: "Bangladesh",
  division: "",
  district: "",
  thana: "",
  union: "",
  area: "",
  permanentLocation: {
    country: "Bangladesh",
    division: "",
    district: "",
    thana: "",
    union: "",
    area: "",
  },
  guardianRelation: "",
  guardianName: "",
  guardianMobileNumber: "",
  fatherName: "",
  fatherProfession: "",
  motherName: "",
  motherProfession: "",
  numberOfSiblings: 0,
  siblings: [],
  educationDetails: ["SSC", "HSC", "Graduation", "Other"].map((level) => ({
    level,
    instituteName: "",
    year: "",
  })),
  aboutYourself: "",
  habitAnswers: Object.fromEntries(habitOptions.map((habit) => [habit, ""])),
  hobbies: [],
  smoke: "No",
  drink: "No",
  diet: "No Preference",
  photos: [],
  partnerPreferences: {
    age: "",
    height: "",
    weight: "",
    maritalStatus: "",
    religion: "",
    highestEducation: "",
    annualIncome: "",
    country: "",
    division: "",
    district: "",
    thana: "",
    union: "",
    area: "",
    familyType: "",
    familyStatus: "",
    familyValues: "",
    bloodGroup: "",
    complexion: "",
  },
  familyAwareOfBiodata: "",
  informationAccurate: "",
  truthDeclaration: "",
  acceptsFalseInformationLiability: false,
};
export default function OnboardingPage() {
  const router = useRouter(),
    [data, setData] = React.useState<D>(blank),
    [step, setStep] = React.useState(1),
    [busy, setBusy] = React.useState(true),
    [deletingPhotoId, setDeletingPhotoId] = React.useState<string | null>(null),
    [error, setError] = React.useState(""),
    [missingFields, setMissingFields] = React.useState<string[]>([]);
  const { language, translateText: text } = useLanguage();
  const [professionOptions, setProfessionOptions] = React.useState<Array<{ value: string; label: string }>>([]);
  const emptyLocations = {
    divisions: [] as string[],
    districts: [] as string[],
    thanas: [] as string[],
    unions: [] as string[],
    labels: {} as Record<string, string>,
  };
  const [locations, setLocations] = React.useState(emptyLocations);
  const [permanentLocations, setPermanentLocations] =
    React.useState(emptyLocations);
  const [partnerOptionMap, setPartnerOptionMap] = React.useState<Record<string, Array<{ value: string; label: string }>>>({});
  const locationCache = React.useRef<Record<string, { options: string[]; labels: Record<string, string> }>>({});
  const {
    division: permanentDivision,
    district: permanentDistrict,
    thana: permanentThana,
  } = data.permanentLocation || {};
  React.useEffect(() => {
    apiClient
      .get<{ data?: D; step?: number }>("/api/auth/onboarding")
      .then((x) => {
        const cleanOnboardingData = { ...(x.data || {}) } as D;
        delete cleanOnboardingData.highestEducation;

        setData({
          ...blank,
          ...cleanOnboardingData,
          photos: cleanOnboardingData.photos || [],
          siblings: cleanOnboardingData.siblings || [],
          educationDetails: cleanOnboardingData.educationDetails || blank.educationDetails,
          partnerPreferences: {
            ...blank.partnerPreferences,
            ...(cleanOnboardingData.partnerPreferences || {}),
          },
        });
        setStep(x.step || 1);
      })
      .catch((e) =>
        setError(
          e.message === "SESSION_EXPIRED"
            ? text("Your session has expired. Please log in again.")
            : e.message,
        ),
      )
      .finally(() => setBusy(false));
  }, [text]);
  const loadLocations = async (
    level: string,
    params: string = "",
    target: "current" | "permanent" = "current",
  ) => {
    const cacheKey = `${target}:${level}:${params}`;
    if (locationCache.current[cacheKey]) {
      const cached = locationCache.current[cacheKey];
      registerLocationLabels(cached.labels || {});
      const key = level as "divisions" | "districts" | "thanas" | "unions";
      const setter = target === "current" ? setLocations : setPermanentLocations;
      setter((v) => ({
        ...v,
        [key]: cached.options || [],
        labels: { ...v.labels, ...(cached.labels || {}) },
      }));
      return;
    }

    const result = await fetch(`/api/locations?level=${level}${params}`, {
      cache: "force-cache",
    }).then((r) => r.json());
    const payload = {
      options: result.options || [],
      labels: result.labels || {},
    };
    locationCache.current[cacheKey] = payload;
    registerLocationLabels(payload.labels || {});
    const key = level as "divisions" | "districts" | "thanas" | "unions";
    const setter = target === "current" ? setLocations : setPermanentLocations;
    setter((v) => ({
      ...v,
      [key]: payload.options || [],
      labels: { ...v.labels, ...(payload.labels || {}) },
    }));
  };
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

    async function loadPartnerOptions() {
      try {
        const response = await fetch(`/api/options/partner?lang=${language === "bn" ? "bn" : "en"}`, { cache: "force-cache" });
        const data = await response.json();
        setPartnerOptionMap(data.options || {});
      } catch {
        setPartnerOptionMap({});
      }
    }

    void loadProfessionOptions();
    void loadPartnerOptions();
  }, [language]);

  React.useEffect(() => {
    void loadLocations("divisions");
  }, []);
  React.useEffect(() => {
    void loadLocations("divisions", "", "permanent");
  }, []);
  React.useEffect(() => {
    if (data.division)
      void loadLocations(
        "districts",
        `&division=${encodeURIComponent(data.division)}`,
      );
  }, [data.division]);
  React.useEffect(() => {
    if (data.division && data.district)
      void loadLocations(
        "thanas",
        `&division=${encodeURIComponent(data.division)}&district=${encodeURIComponent(data.district)}`,
      );
  }, [data.division, data.district]);
  React.useEffect(() => {
    if (data.division && data.district && data.thana)
      void loadLocations(
        "unions",
        `&division=${encodeURIComponent(data.division)}&district=${encodeURIComponent(data.district)}&thana=${encodeURIComponent(data.thana)}`,
      );
  }, [data.division, data.district, data.thana]);
  React.useEffect(() => {
    if (permanentDivision)
      void loadLocations(
        "districts",
        `&division=${encodeURIComponent(permanentDivision)}`,
        "permanent",
      );
  }, [permanentDivision]);
  React.useEffect(() => {
    if (permanentDivision && permanentDistrict)
      void loadLocations(
        "thanas",
        `&division=${encodeURIComponent(permanentDivision)}&district=${encodeURIComponent(permanentDistrict)}`,
        "permanent",
      );
  }, [permanentDivision, permanentDistrict]);
  React.useEffect(() => {
    if (permanentDivision && permanentDistrict && permanentThana)
      void loadLocations(
        "unions",
        `&division=${encodeURIComponent(permanentDivision)}&district=${encodeURIComponent(permanentDistrict)}&thana=${encodeURIComponent(permanentThana)}`,
        "permanent",
      );
  }, [permanentDivision, permanentDistrict, permanentThana]);
  const put = (k: string, v: any) => {
    setData((x) => ({ ...x, [k]: v }));
    setMissingFields((fields) => fields.filter((field) => field !== k && !field.startsWith(`${k}.`) && !(k === "permanentLocation" && field.startsWith("permanent."))));
  };
  const fieldError = (k: string) =>
    missingFields.includes(k) ? text("This field is required") : undefined;
  const readField = (k: string) =>
    k.startsWith("partnerPreferences.")
      ? data.partnerPreferences[k.slice(19)]
      : data[k];
  const writeField = (k: string, v: any) =>
    k.startsWith("partnerPreferences.")
      ? put("partnerPreferences", {
          ...data.partnerPreferences,
          [k.slice(19)]: v,
        })
      : put(k, v);
  const input = (label: string, k: string, type = "text") => (
    <Input
      label={text(label)}
      type={type}
      value={
        k === "motherTongue" && language === "bn"
          ? text(data[k] || "")
          : k === "country" && language === "bn"
            ? translateLocationLabel(data[k] || "", language)
            : data[k] || ""
      }
      error={fieldError(k)}
      onChange={(e) =>
        put(
          k,
          k === "motherTongue" &&
            language === "bn" &&
            e.target.value === "বাংলা"
            ? "Bengali"
            : k === "country" &&
                language === "bn" &&
                e.target.value === "বাংলাদেশ"
              ? "Bangladesh"
              : e.target.value,
        )
      }
      required
    />
  );
  const phoneInput = (label: string, k: string) => (
    <Input
      label={text(label)}
      type="tel"
      inputMode="numeric"
      pattern="01[3-9][0-9]{8}"
      maxLength={11}
      value={data[k] || ""}
      error={fieldError(k)}
      onChange={(e) => put(k, e.target.value.replace(/\D/g, "").slice(0, 11))}
      required
    />
  );
  const select = (
    label: string,
    k: string,
    options: string[],
    labels: Record<string, string> = {},
  ) => (
    <label className="text-sm font-medium">
      {text(label)}
      <select
        className="mt-1 flex h-11 w-full rounded-xl border border-input bg-background px-3"
        value={readField(k)}
        onChange={(e) => writeField(k, e.target.value)}
      >
        <option value="">{text("Select")}</option>
        {options.map((x) => (
          <option key={x} value={x}>
            {language === "bn"
              ? labels[x] || text(translateLocationLabel(x, language))
              : x.replace(/\u0000/g, "")}
          </option>
        ))}
      </select>
      {fieldError(k) ? <p className="mt-1 text-xs text-destructive">{fieldError(k)}</p> : null}
    </label>
  );
  const dynamicSelect = (
    label: string,
    k: string,
    category: string,
    includeAny: boolean = true,
  ) => {
    const options = partnerOptionMap[category] || [];
    const hasAnyOption = options.some((option) => option.value === "");
    return (
      <label className="text-sm font-medium">
        {text(label)}
        <select
          className="mt-1 flex h-11 w-full rounded-xl border border-input bg-background px-3"
          value={readField(k)}
          onChange={(e) => writeField(k, e.target.value)}
        >
          {includeAny && !hasAnyOption ? <option value="">{language === "bn" ? "যেকোনো" : "Any"}</option> : null}
          {!includeAny ? <option value="">{text("Select")}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  };
  const siblings = Array.isArray(data.siblings) ? data.siblings : [];
  const siblingCount = (relation: "Brother" | "Sister") =>
    siblings.filter((s: any) => s.relation === relation).length;
  const setSiblingCount = (relation: "Brother" | "Sister", count: number) => {
    const other = siblings.filter((s: any) => s.relation !== relation),
      same = siblings.filter((s: any) => s.relation === relation);
    const next = [
      ...same.slice(0, count),
      ...Array.from({ length: Math.max(0, count - same.length) }, () => ({
        name: "",
        profession: "",
        relation,
      })),
    ];
    put("siblings", [...other, ...next]);
    put("numberOfSiblings", other.length + next.length);
  };
  const setSiblingField = (
    relation: "Brother" | "Sister",
    index: number,
    fieldName: "name" | "profession",
    value: string,
  ) => {
    let seen = 0;
    setMissingFields((fields) => fields.filter((field) => field !== `sibling.${relation}.${index}.${fieldName}`));
    put(
      "siblings",
      siblings.map((s: any) => {
        if (s.relation !== relation) return s;
        const updated = seen === index ? { ...s, [fieldName]: value } : s;
        seen++;
        return updated;
      }),
    );
  };
  const invalid = () => {
    const fieldLabels: Record<string, string> = {
      firstName: "First Name",
      lastName: "Last Name",
      gender: "Gender",
      dateOfBirth: "Date of Birth",
      height: "Height",
      bloodGroup: "Blood Group",
      complexion: "Complexion",
      hasMajorHealthIssue: "Do you have any physical problem or major illness?",
      majorHealthIssueDetails: "Please specify the physical problem or illness",
      maritalStatus: "Marital Status",
      religion: "Religion",
      profession: "Profession",
      institution: "Institution/Organization Name",
      motherTongue: "Mother Tongue",
      whatsappNumber: "WhatsApp/Imo Number",
      guardianRelation: "Guardian",
      guardianName: "Guardian Name",
      guardianMobileNumber: "Guardian Mobile Number",
      fatherName: "Father Name",
      fatherProfession: "Father's Profession",
      motherName: "Mother Name",
      motherProfession: "Mother's Profession",
      country: "Country",
      division: "Division",
      district: "District",
      thana: "Thana",
      union: "Union",
      area: "Area",
      maritalStatusDate: "Separation/Divorce Date",
      aboutYourself: "About Yourself",
    };
    const need: Record<number, string[]> = {
      1: [
        "firstName",
        "lastName",
        "gender",
        "dateOfBirth",
        "height",
        "bloodGroup",
        "complexion",
        "hasMajorHealthIssue",
        "maritalStatus",
        "religion",
        "profession",
        "institution",
        "motherTongue",
        "whatsappNumber",
      ],
      2: [
        "guardianRelation",
        "guardianName",
        "guardianMobileNumber",
        "fatherName",
        "fatherProfession",
        "motherName",
        "motherProfession",
      ],
      3: ["country", "division", "district", "thana", "union", "area"],
      8: ["familyAwareOfBiodata", "informationAccurate", "truthDeclaration"],
    };
    const missingFields = (need[step] || []).filter((k) => !String(data[k] || "").trim());
    if (step === 2) {
      siblings.forEach((sibling: any, index: number) => {
        if (!String(sibling.name || "").trim()) missingFields.push(`sibling.${sibling.relation}.${index}.name`);
        if (!String(sibling.profession || "").trim()) missingFields.push(`sibling.${sibling.relation}.${index}.profession`);
      });
    }
    if (step === 1 && ["Divorced", "Awaiting Divorce"].includes(data.maritalStatus) && !String(data.maritalStatusDate || "").trim()) {
      missingFields.push("maritalStatusDate");
    }
    if (step === 1 && data.hasMajorHealthIssue === "Yes" && !String(data.majorHealthIssueDetails || "").trim()) {
      missingFields.push("majorHealthIssueDetails");
    }
    if (step === 5 && !String(data.aboutYourself || "").trim()) missingFields.push("aboutYourself");
    if (missingFields.length) {
      setMissingFields(missingFields);
      return `${text("Please complete these fields")}: ${missingFields.map((field) => text(fieldLabels[field] || field)).join(", ")}`;
    }
    if (
      step === 1 &&
      data.maritalStatus !== "Never Married" &&
      String(data.childrenCount || "").trim() === ""
    )
      return text("Please enter the number of children.");
    if (step === 1 && !/^\+88\d{11}$/.test(data.whatsappNumber))
      return text("WhatsApp/Imo number must be exactly 11 digits.");
    if (step === 3) {
      const missingPermanentFields = ["country", "division", "district", "thana", "union", "area"]
        .filter((field) => !String(data.permanentLocation?.[field] || "").trim());
      if (missingPermanentFields.length) {
        const permanentKeys = missingPermanentFields.map((field) => `permanent.${field}`);
        setMissingFields(permanentKeys);
        return `${text("Please complete these fields")}: ${text("Permanent Address")}, ${missingPermanentFields.map((field) => text(fieldLabels[field])).join(", ")}`;
      }
    }
    if (step === 2 && !/^01[3-9][0-9]{8}$/.test(data.guardianMobileNumber)) {
      setMissingFields((fields) => [...new Set([...fields, "guardianMobileNumber"])]);
      return text("Enter an 11-digit guardian mobile number.");
    }
    if (
      step === 2 &&
      siblings.length > 0 &&
      siblings.some((sibling: any) => !String(sibling.name || "").trim() || !String(sibling.profession || "").trim())
    )
      return text("Please complete every sibling field.");
    if (
      step === 4 &&
      !data.educationDetails.some(
        (entry: any) =>
          String(entry.instituteName || "").trim() ||
          String(entry.year || "").trim(),
      )
    )
      return text("Complete at least one education field.");
    if (step === 5 && habitOptions.some((habit) => !data.habitAnswers?.[habit]))
      return text("Please answer Yes or No for every habit.");
    if (step === 5 && !String(data.aboutYourself || "").trim())
      return text("Please write something about yourself.");
    if (step === 6 && data.photos.length < 1) {
      setMissingFields(["photos"]);
      return text("Upload at least one photo.");
    }
    if (
      step === 7 &&
      requiredPartnerFields
        .filter((field) => field !== "annualIncome")
        .some((field) => !String(data.partnerPreferences?.[field] || "").trim())
    )
      return text("Please complete every expected partner field.");
    if (step === 8 && !data.acceptsFalseInformationLiability)
      return text("Please accept the declaration.");
    return "";
  };
  const save = async (final = false) => {
    const msg = invalid();
    if (msg) return setError(msg);
    setBusy(true);
    setError("");
    try {
      const selectedHabits = habitOptions.filter(
        (habit) => data.habitAnswers?.[habit] === "Yes",
      );
      const sanitizedData = { ...data } as D;
      delete sanitizedData.highestEducation;

      await apiClient.patch("/api/auth/onboarding", {
        data: sanitizedData,
        step: final ? 8 : step + 1,
        completed: false,
      });
      if (final) {
        const profilePayload = {
          ...sanitizedData,
          numberOfSiblings: Number(data.numberOfSiblings) || 0,
          partnerPreference: data.aboutYourself,
          weight: "",
          familyType: "Nuclear",
          familyStatus: "Middle Class",
          familyValues: "Moderate",
          languages: [data.motherTongue],
          diet: "No Preference",
          hobbies: selectedHabits,
        };
        const existingProfile = await apiClient.get<{ profile?: unknown }>(
          "/api/profile",
        );
        if (existingProfile.profile)
          await apiClient.put("/api/profile", profilePayload);
        else await apiClient.post("/api/profile", profilePayload);
        await apiClient.patch("/api/auth/onboarding", {
          data,
          step: 8,
          completed: true,
        });
        router.replace("/dashboard");
      } else setStep(step + 1);
    } catch (e) {
      setError(
        e instanceof Error && e.message === "SESSION_EXPIRED"
          ? text("Your session has expired. Please log in again.")
          : e instanceof Error
            ? e.message
            : text("Unable to save."),
      );
    } finally {
      setBusy(false);
    }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    if (data.photos.length >= 4)
      return setError(text("Maximum 4 photos allowed."));
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const x = await apiClient.request<{ photo: any }>(
        "/api/profile/photos/upload",
        { method: "POST", body: fd },
      );
      put("photos", [
        ...data.photos,
        { ...x.photo, isPrimary: data.photos.length === 0 },
      ]);
    } catch (e) {
      setError(
        e instanceof Error && e.message === "SESSION_EXPIRED"
          ? text("Your session has expired. Please log in again.")
          : e instanceof Error
            ? e.message
            : text("Upload failed"),
      );
    } finally {
      setBusy(false);
    }
  };
  const deletePhoto = async (publicId: string) => {
    if (!publicId || deletingPhotoId) return;
    setDeletingPhotoId(publicId);
    setError("");
    try {
      const safePublicId = encodeURIComponent(publicId);
      await apiClient.request(`/api/profile/photos?publicId=${safePublicId}`, {
        method: "DELETE",
      });
      const remaining = data.photos.filter(
        (photo: any) => photo.publicId !== publicId,
      );
      if (
        remaining.length > 0 &&
        !remaining.some((photo: any) => photo.isPrimary)
      )
        remaining[0] = { ...remaining[0], isPrimary: true };
      put("photos", remaining);
    } catch (e) {
      setError(
        e instanceof Error && e.message === "SESSION_EXPIRED"
          ? text("Your session has expired. Please log in again.")
          : e instanceof Error
            ? e.message
            : text("Failed to delete photo."),
      );
    } finally {
      setDeletingPhotoId(null);
    }
  };
  const yn = (label: string, k: string) => (
    <div>
      <p className="mb-2 text-sm font-medium">{text(label)}</p>
      {["Yes", "No"].map((v) => (
        <label className="mr-5 text-sm" key={v}>
          <input
            className="mr-1"
            type="radio"
            checked={data[k] === v}
            onChange={() => put(k, v)}
          />
          {text(v)}
        </label>
      ))}
    </div>
  );
  // Keep the form mounted while saving. Replacing it during a click can make
  // React attempt to remove an already-reconciled DOM child in development.
  if (busy && step === 1 && !data.firstName && !data.lastName && !data.gender)
    return <main className="p-10 text-center">{text("Loading...")}</main>;
  return (
    <main className="onboarding-root min-h-screen bg-rose-50 p-4 md:p-8">
      <div className="onboarding-form-layout">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>{text(titles[step - 1])}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && (
              <p className="rounded bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {input("First Name", "firstName")}
                {input("Last Name", "lastName")}
                <label className="text-sm font-medium">
                  {text("WhatsApp/Imo Number")}
                  <div className="mt-1 flex h-11 overflow-hidden rounded-xl border border-input bg-background">
                    <span className="flex items-center border-r px-3 text-muted-foreground">
                      +88
                    </span>
                    <input
                      className="min-w-0 flex-1 bg-transparent px-3 outline-none"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{11}"
                      maxLength={11}
                      value={String(data.whatsappNumber || "").replace(
                        /^\+88/,
                        "",
                      )}
                      onChange={(e) =>
                        put(
                          "whatsappNumber",
                          `+88${e.target.value.replace(/\D/g, "").slice(0, 11)}`,
                        )
                      }
                      required
                    />
                  </div>
                </label>
                <Input
                  label={text("Email (Optional)")}
                  type="email"
                  value={data.email || ""}
                  onChange={(e) => put("email", e.target.value)}
                />
                {select("Gender", "gender", ["Male", "Female"])}
                <label className="text-sm font-medium">
                  {text("Date of Birth")}
                  <div className="mt-1">
                    <DatePicker
                      value={data.dateOfBirth}
                      onChange={(value) => put("dateOfBirth", value)}
                      placeholder={text("Select date of birth")}
                    />
                    {fieldError("dateOfBirth") ? <p className="mt-1 text-xs text-destructive">{fieldError("dateOfBirth")}</p> : null}
                  </div>
                </label>
                {select("Blood Group", "bloodGroup", [
                  "A+",
                  "A-",
                  "B+",
                  "B-",
                  "AB+",
                  "AB-",
                  "O+",
                  "O-",
                ])}
                {select("Complexion", "complexion", ["Fair", "Bright", "Wheatish", "Dusky", "Dark"])}
                {select("Height", "height", [...HEIGHTS], heightLabels)}
                {select("Marital Status", "maritalStatus", [
                  "Never Married",
                  "Married",
                  "Divorced",
                  "Widowed",
                  "Awaiting Divorce",
                ])}
                {data.maritalStatus !== "Never Married" ? (
                  <>
                    <Input
                      label={text("Number of Children")}
                      type="text"
                      inputMode="numeric"
                      value={String(data.childrenCount || "")}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        put("childrenCount", value === "" ? "" : String(Math.min(20, Number.parseInt(value, 10) || 0)));
                      }}
                      required
                    />
                    {["Divorced", "Awaiting Divorce"].includes(data.maritalStatus) ? (
                      <label className="text-sm font-medium">
                        {text("Separation/Divorce Date")}
                        <div className="mt-1">
                          <DatePicker value={data.maritalStatusDate} onChange={(value) => put("maritalStatusDate", value)} placeholder={text("Select separation/divorce date")} />
                          {fieldError("maritalStatusDate") ? <p className="mt-1 text-xs text-destructive">{fieldError("maritalStatusDate")}</p> : null}
                        </div>
                      </label>
                    ) : null}
                  </>
                ) : null}
                {select("Religion", "religion", [...RELIGIONS])}
                <label className="text-sm font-medium">
                  {text("Profession")}
                  <select
                    className="mt-1 flex h-11 w-full rounded-xl border border-input bg-background px-3"
                    value={data.profession || ""}
                    onChange={(e) => put("profession", e.target.value)}
                  >
                    <option value="">{text("Select")}</option>
                    {professionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                {input("Institution/Organization Name", "institution")}
                {input("Mother Tongue", "motherTongue")}
                {yn("Do you have any physical problem or major illness?", "hasMajorHealthIssue")}
                {data.hasMajorHealthIssue === "Yes" ? input("Please specify the physical problem or illness", "majorHealthIssueDetails") : null}
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {select("Guardian", "guardianRelation", [
                    "Father",
                    "Mother",
                    "Brother",
                    "Sister",
                  ])}
                  {input("Guardian Name", "guardianName")}
                  {phoneInput("Guardian Mobile Number", "guardianMobileNumber")}
                  {input("Father Name", "fatherName")}
                  {input("Father's Profession", "fatherProfession")}
                  {input("Mother Name", "motherName")}
                  {input("Mother's Profession", "motherProfession")}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <section className="rounded-xl border bg-muted/20 p-4">
                    <Input
                      label={text("How many brothers?")}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={10}
                      step={1}
                      value={siblingCount("Brother")}
                      onChange={(e) =>
                        setSiblingCount(
                          "Brother",
                          Math.min(
                            10,
                            Math.max(
                              0,
                              Number.parseInt(
                                e.target.value.replace(/\D/g, ""),
                                10,
                              ) || 0,
                            ),
                          ),
                        )
                      }
                    />
                    {Array.from(
                      { length: siblingCount("Brother") },
                      (_, index) => (
                        <div
                          className="mt-3 grid gap-3 rounded-lg border border-border/70 bg-background/70 p-3"
                          key={`brother-${index}`}
                        >
                          <Input
                            label={`${index + 1}. ${text("Brother")} ${text("Name")}`}
                            error={fieldError(`sibling.Brother.${index}.name`)}
                            value={
                              siblings.filter(
                                (s: any) => s.relation === "Brother",
                              )[index]?.name || ""
                            }
                            onChange={(e) =>
                              setSiblingField(
                                "Brother",
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            label={text("Profession / Occupation")}
                            error={fieldError(`sibling.Brother.${index}.profession`)}
                            placeholder={text(
                              "Example: Student, Business, Service",
                            )}
                            value={
                              siblings.filter(
                                (s: any) => s.relation === "Brother",
                              )[index]?.profession || ""
                            }
                            onChange={(e) =>
                              setSiblingField(
                                "Brother",
                                index,
                                "profession",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      ),
                    )}
                  </section>
                  <section className="rounded-xl border bg-muted/20 p-4">
                    <Input
                      label={text("How many sisters?")}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={10}
                      step={1}
                      value={siblingCount("Sister")}
                      onChange={(e) =>
                        setSiblingCount(
                          "Sister",
                          Math.min(
                            10,
                            Math.max(
                              0,
                              Number.parseInt(
                                e.target.value.replace(/\D/g, ""),
                                10,
                              ) || 0,
                            ),
                          ),
                        )
                      }
                    />
                    {Array.from(
                      { length: siblingCount("Sister") },
                      (_, index) => (
                        <div
                          className="mt-3 grid gap-3 rounded-lg border border-border/70 bg-background/70 p-3"
                          key={`sister-${index}`}
                        >
                          <Input
                            label={`${index + 1}. ${text("Sister")} ${text("Name")}`}
                            error={fieldError(`sibling.Sister.${index}.name`)}
                            value={
                              siblings.filter(
                                (s: any) => s.relation === "Sister",
                              )[index]?.name || ""
                            }
                            onChange={(e) =>
                              setSiblingField(
                                "Sister",
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            label={text("Profession / Occupation")}
                            error={fieldError(`sibling.Sister.${index}.profession`)}
                            placeholder={text(
                              "Example: Student, Business, Service",
                            )}
                            value={
                              siblings.filter(
                                (s: any) => s.relation === "Sister",
                              )[index]?.profession || ""
                            }
                            onChange={(e) =>
                              setSiblingField(
                                "Sister",
                                index,
                                "profession",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      ),
                    )}
                  </section>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-7">
                <div>
                  <h3 className="mb-3 text-lg font-semibold">
                    {text("Present Address")}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {input("Country", "country")}
                    {select("Division", "division", locations.divisions)}
                    {select("District", "district", locations.districts)}
                    {select("Thana", "thana", locations.thanas)}
                    {select("Union", "union", locations.unions)}
                    {input("Area", "area")}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-lg font-semibold">
                    {text("Permanent Address")}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label={text("Country")}
                      error={fieldError("permanent.country")}
                      value={
                        language === "bn"
                          ? translateLocationLabel(
                              data.permanentLocation.country,
                              language,
                            )
                          : data.permanentLocation.country
                      }
                      onChange={(e) =>
                        put("permanentLocation", {
                          ...data.permanentLocation,
                          country:
                            e.target.value === "বাংলাদেশ"
                              ? "Bangladesh"
                              : e.target.value,
                        })
                      }
                    />
                    <label className="text-sm font-medium">
                      {text("Division")}
                      <select
                        className="mt-1 flex h-11 w-full rounded-xl border border-input bg-background px-3"
                        value={data.permanentLocation.division}
                        onChange={(e) =>
                          put("permanentLocation", {
                            ...data.permanentLocation,
                            division: e.target.value,
                            district: "",
                            thana: "",
                            union: "",
                          })
                        }
                      >
                        <option value="">{text("Select")}</option>
                        {permanentLocations.divisions.map((v) => (
                          <option key={v} value={v}>
                            {translateLocationLabel(v, language)}
                          </option>
                        ))}
                      </select>
                      {fieldError("permanent.division") ? <p className="mt-1 text-xs text-destructive">{fieldError("permanent.division")}</p> : null}
                    </label>
                    <label className="text-sm font-medium">
                      {text("District")}
                      <select
                        className="mt-1 flex h-11 w-full rounded-xl border border-input bg-background px-3"
                        value={data.permanentLocation.district}
                        onChange={(e) =>
                          put("permanentLocation", {
                            ...data.permanentLocation,
                            district: e.target.value,
                            thana: "",
                            union: "",
                          })
                        }
                      >
                        <option value="">{text("Select")}</option>
                        {permanentLocations.districts.map((v) => (
                          <option key={v} value={v}>
                            {translateLocationLabel(v, language)}
                          </option>
                        ))}
                      </select>
                      {fieldError("permanent.district") ? <p className="mt-1 text-xs text-destructive">{fieldError("permanent.district")}</p> : null}
                    </label>
                    <label className="text-sm font-medium">
                      {text("Thana")}
                      <select
                        className="mt-1 flex h-11 w-full rounded-xl border border-input bg-background px-3"
                        value={data.permanentLocation.thana}
                        onChange={(e) =>
                          put("permanentLocation", {
                            ...data.permanentLocation,
                            thana: e.target.value,
                            union: "",
                          })
                        }
                      >
                        <option value="">{text("Select")}</option>
                        {permanentLocations.thanas.map((v) => (
                          <option key={v} value={v}>
                            {translateLocationLabel(v, language)}
                          </option>
                        ))}
                      </select>
                      {fieldError("permanent.thana") ? <p className="mt-1 text-xs text-destructive">{fieldError("permanent.thana")}</p> : null}
                    </label>
                    <label className="text-sm font-medium">
                      {text("Union")}
                      <select
                        className="mt-1 flex h-11 w-full rounded-xl border border-input bg-background px-3"
                        value={data.permanentLocation.union}
                        onChange={(e) =>
                          put("permanentLocation", {
                            ...data.permanentLocation,
                            union: e.target.value,
                          })
                        }
                      >
                        <option value="">{text("Select")}</option>
                        {permanentLocations.unions.map((v) => (
                          <option key={v} value={v}>
                            {translateLocationLabel(v, language)}
                          </option>
                        ))}
                      </select>
                      {fieldError("permanent.union") ? <p className="mt-1 text-xs text-destructive">{fieldError("permanent.union")}</p> : null}
                    </label>
                    <Input
                      label={text("Area")}
                      error={fieldError("permanent.area")}
                      value={data.permanentLocation.area}
                      onChange={(e) =>
                        put("permanentLocation", {
                          ...data.permanentLocation,
                          area: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-4">
                {data.educationDetails.map((x: any, i: number) => (
                  <div className="grid gap-3 sm:grid-cols-3" key={x.level}>
                    <b className="self-center">{text(x.level)}</b>
                    <Input
                      label={text("Institute Name")}
                      value={x.instituteName}
                      onChange={(e) =>
                        put(
                          "educationDetails",
                          data.educationDetails.map((a: any, n: number) =>
                            n === i
                              ? { ...a, instituteName: e.target.value }
                              : a,
                          ),
                        )
                      }
                    />
                    <Input
                      label={text("Year")}
                      value={x.year}
                      onChange={(e) =>
                        put(
                          "educationDetails",
                          data.educationDetails.map((a: any, n: number) =>
                            n === i ? { ...a, year: e.target.value } : a,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
            {step === 5 && (
              <div className="space-y-5">
                <textarea
                  className="min-h-32 w-full rounded-xl border p-3"
                  placeholder="নিজের সম্পর্কে লিখুন"
                  value={data.aboutYourself}
                  onChange={(e) => put("aboutYourself", e.target.value)}
                />
                {fieldError("aboutYourself") ? <p className="text-xs text-destructive">{fieldError("aboutYourself")}</p> : null}
                <fieldset>
                  <legend className="mb-3 text-sm font-semibold">
                    {text("Your habits")}
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {habitOptions.map((habit) => (
                      <div className="rounded-lg border p-3" key={habit}>
                        <p className="mb-2 text-sm font-medium">
                          {text(habit)}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name={`habit-${habit}`}
                              checked={data.habitAnswers?.[habit] === "Yes"}
                              onChange={() =>
                                put("habitAnswers", {
                                  ...data.habitAnswers,
                                  [habit]: "Yes",
                                })
                              }
                            />
                            {text("Yes")}
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name={`habit-${habit}`}
                              checked={data.habitAnswers?.[habit] === "No"}
                              onChange={() =>
                                put("habitAnswers", {
                                  ...data.habitAnswers,
                                  [habit]: "No",
                                })
                              }
                            />
                            {text("No")}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}{" "}
            {step === 6 && (
              <div>
                <label className="block cursor-pointer rounded-xl border border-dashed p-8 text-center">
                  ছবি আপলোড করুন (১–৪টি)
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(e) => upload(e.target.files?.[0])}
                  />
                </label>
                {missingFields.includes("photos") ? <p className="mt-1 text-xs text-destructive">{text("At least one photo is required")}</p> : null}
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {data.photos.map((p: any) => (
                    <div
                      className="relative aspect-square overflow-hidden rounded-lg"
                      key={p.publicId}
                    >
                      <img
                        className="h-full w-full object-cover"
                        src={p.url}
                        alt="Uploaded"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/65 text-white transition hover:bg-red-600 disabled:opacity-60"
                        onClick={() => deletePhoto(p.publicId)}
                        disabled={deletingPhotoId === p.publicId}
                        aria-label={text("Delete image")}
                        title={text("Delete image")}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {step === 7 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {dynamicSelect("Age", "partnerPreferences.age", "age")}
                {dynamicSelect("Height", "partnerPreferences.height", "height")}
                {dynamicSelect("Weight", "partnerPreferences.weight", "weight")}
                {dynamicSelect("Blood Group", "partnerPreferences.bloodGroup", "bloodGroup")}
                {dynamicSelect("Complexion", "partnerPreferences.complexion", "complexion")}
                {dynamicSelect("Marital Status", "partnerPreferences.maritalStatus", "maritalStatus")}
                {dynamicSelect("Religion", "partnerPreferences.religion", "religion")}
                {dynamicSelect("Highest Education", "partnerPreferences.highestEducation", "highestEducation")}
                <Input
                  label={text("Annual Income")}
                  placeholder={text("Example: 50,000-100,000")}
                  value={data.partnerPreferences.annualIncome}
                  onChange={(e) =>
                    writeField(
                      "partnerPreferences.annualIncome",
                      e.target.value,
                    )
                  }
                />
                <Input
                  label={text("Country")}
                  value={data.partnerPreferences.country}
                  onChange={(e) =>
                    writeField("partnerPreferences.country", e.target.value)
                  }
                  required
                />
                <Input
                  label={text("Division")}
                  placeholder={text("Example: Dhaka, Chattogram")}
                  value={data.partnerPreferences.division}
                  onChange={(e) =>
                    writeField("partnerPreferences.division", e.target.value)
                  }
                  required
                />
                <Input
                  label={text("District")}
                  placeholder={text("Example: Dhaka, Coxsbazar")}
                  value={data.partnerPreferences.district}
                  onChange={(e) =>
                    writeField("partnerPreferences.district", e.target.value)
                  }
                  required
                />
                {dynamicSelect("Family Type", "partnerPreferences.familyType", "familyType")}
                {dynamicSelect("Family Status", "partnerPreferences.familyStatus", "familyStatus")}
                {dynamicSelect("Family Values", "partnerPreferences.familyValues", "familyValues")}
              </div>
            )}
            {step === 8 && (
              <div className="space-y-6">
                {yn(
                  "Does your family know that you are submitting this biodata on the website?",
                  "familyAwareOfBiodata",
                )}
                {yn(
                  "I confirm before Allah that all information is accurate.",
                  "informationAccurate",
                )}
                {yn(
                  "I declare before Allah that all information is accurate.",
                  "truthDeclaration",
                )}
                <label className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={data.acceptsFalseInformationLiability}
                    onChange={(e) =>
                      put("acceptsFalseInformationLiability", e.target.checked)
                    }
                  />
                  {text(
                    "I accept legal and religious responsibility for false information.",
                  )}
                </label>
              </div>
            )}
            <div className="flex justify-between pt-3">
              {step > 1 ? (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setStep(step - 1)}
                >
                  {text("Previous step")}
                </Button>
              ) : (
                <span />
              )}
              <Button disabled={busy} onClick={() => save(step === 8)}>
                {busy
                  ? text("Saving...")
                  : step === 8
                    ? text("Complete")
                    : text("Next")}
              </Button>
            </div>
          </CardContent>
        </Card>
        <StepTracker current={step} />
      </div>
    </main>
  );
}
