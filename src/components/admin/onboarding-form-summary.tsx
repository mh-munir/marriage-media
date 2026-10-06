import Image from "next/image";
import { BookOpen, HeartHandshake, MapPin, UserRound, Users } from "lucide-react";

type OnboardingRecord = Record<string, unknown>;
type OnboardingPhoto = { url?: string; isPrimary?: boolean };

const sections: Array<{ title: string; icon: typeof UserRound; fields: string[] }> = [
  {
    title: "Personal information",
    icon: UserRound,
    fields: ["firstName", "lastName", "gender", "dateOfBirth", "maritalStatus", "maritalStatusDate", "childrenCount", "height", "bloodGroup", "complexion", "religion", "motherTongue", "email", "whatsappNumber", "hasMajorHealthIssue", "majorHealthIssueDetails"],
  },
  {
    title: "Family information",
    icon: Users,
    fields: ["guardianRelation", "guardianName", "guardianMobileNumber", "fatherName", "fatherProfession", "motherName", "motherProfession", "numberOfSiblings", "siblings"],
  },
  {
    title: "Address",
    icon: MapPin,
    fields: ["country", "division", "district", "thana", "union", "area", "presentAddress", "permanentAddress", "permanentLocation"],
  },
  {
    title: "Education and career",
    icon: BookOpen,
    fields: ["educationDetails", "profession", "institution"],
  },
  {
    title: "About me",
    icon: HeartHandshake,
    fields: ["aboutYourself"],
  },
  {
    title: "Expected partner",
    icon: HeartHandshake,
    fields: ["partnerPreferences"],
  },
  {
    title: "Confirmation",
    icon: BookOpen,
    fields: ["familyAwareOfBiodata", "informationAccurate", "truthDeclaration", "acceptsFalseInformationLiability"],
  },
] as const;

const labels: Record<string, string> = {
  firstName: "First name",
  lastName: "Last name",
  dateOfBirth: "Date of birth",
  maritalStatus: "Marital status",
  maritalStatusDate: "Marital status date",
  childrenCount: "Number of children",
  bloodGroup: "Blood group",
  motherTongue: "Mother tongue",
  whatsappNumber: "WhatsApp / Imo number",
  hasMajorHealthIssue: "Major health issue",
  majorHealthIssueDetails: "Health issue details",
  guardianRelation: "Guardian relation",
  guardianName: "Guardian name",
  guardianMobileNumber: "Guardian mobile number",
  fatherName: "Father's name",
  fatherProfession: "Father's profession",
  motherName: "Mother's name",
  motherProfession: "Mother's profession",
  numberOfSiblings: "Number of siblings",
  educationDetails: "Education details",
  aboutYourself: "About yourself",
  partnerPreferences: "Partner preferences",
  familyAwareOfBiodata: "Family aware of biodata",
  informationAccurate: "Information is accurate",
  truthDeclaration: "Truth declaration",
  acceptsFalseInformationLiability: "False information liability accepted",
  permanentLocation: "Permanent address",
};

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "" || value === false) return false;
  if (Array.isArray(value)) return value.some(hasValue);
  if (typeof value === "object") return Object.values(value as OnboardingRecord).some(hasValue);
  return true;
}

function formatValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) {
    const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleDateString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item)).filter(Boolean).join("; ");
  }
  if (value && typeof value === "object") {
    return Object.entries(value as OnboardingRecord)
      .filter(([key, item]) => !["_id", "id", "__v"].includes(key) && hasValue(item))
      .map(([key, item]) => `${labels[key] || humanize(key)}: ${formatValue(item)}`)
      .join(" · ");
  }
  return String(value);
}

function humanize(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/^./, (character) => character.toUpperCase());
}

export function OnboardingFormSummary({
  onboardingData,
  profile,
  photos = [],
}: {
  onboardingData?: OnboardingRecord | null;
  profile?: OnboardingRecord | null;
  photos?: OnboardingPhoto[];
}) {
  const formData: OnboardingRecord = { ...(profile || {}), ...(onboardingData || {}) };
  const populatedSections = sections.map((section) => ({
    ...section,
    entries: section.fields
      .map((field) => {
        const value = formData[field];
        const profileValue = profile?.[field];
        const selectedValue = hasValue(value) ? value : profileValue;
        return { key: field, label: labels[field] || humanize(field), value: selectedValue };
      })
      .filter((entry) => hasValue(entry.value)),
  })).filter((section) => section.entries.length > 0);
  const habitAnswers = formData.habitAnswers && typeof formData.habitAnswers === "object"
    ? formData.habitAnswers as OnboardingRecord
    : {};
  const habitEntries = [
    ["Exercise", "আপনি কি নিয়মিত নামাজ পড়েন?"],
    ["Reading", "আপনি কি ইসলামিক বই পড়েন?"],
    ["Travel", "আপনি কি হালাল-হারাম মেনে চলেন?"],
    ["Cooking", "আপনি কি মাহরাম এবং গায়রে মাহরাম মেনে চলেন?"],
  ].flatMap(([key, label]) => {
    const answer = habitAnswers[key];
    if (answer !== "Yes" && answer !== "No") return [];
    return [{ key, label, value: answer === "Yes" ? "হ্যাঁ" : "না" }];
  });
  if (habitEntries.length) {
    populatedSections.splice(4, 0, {
      title: "আপনার অভ্যাস",
      icon: HeartHandshake,
      fields: [],
      entries: habitEntries,
    });
  }
  const submittedPhotos = photos.filter((photo) => Boolean(photo.url));

  return (
    <div className="space-y-4">
      {submittedPhotos.length ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3"><h3 className="text-sm font-semibold text-slate-900">Submitted photos</h3></div>
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
            {submittedPhotos.map((photo, index) => (
              <div key={`${photo.url}-${index}`} className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
                <Image src={photo.url!} alt={`Submitted profile photo ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {populatedSections.map(({ title, icon: Icon, entries }) => (
        <section key={title} className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Icon className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          </div>
          <dl className="grid gap-x-6 px-4 sm:grid-cols-2">
            {entries.map((entry) => (
              <div key={entry.key} className="min-w-0 border-b border-slate-100 py-3 last:border-b-0">
                <dt className="text-xs font-medium text-slate-500">{entry.label}</dt>
                <dd className="mt-1 wrap-break-word text-sm font-medium text-slate-900">{formatValue(entry.value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      {!populatedSections.length && !submittedPhotos.length ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">No onboarding details were submitted.</div>
      ) : null}
    </div>
  );
}
