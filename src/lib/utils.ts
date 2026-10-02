import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "BDT"): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function calculateAge(dateOfBirth: Date | string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const re = /^01[3-9]\d{8}$/;
  return re.test(phone);
}

export function sanitizePhoneNumberInput(value: string): string {
  return value.replace(/\D/g, "");
}

export const GENDERS = ["Male", "Female"] as const;
export const RELIGIONS = [
  "Islam",
  "Hinduism",
  "Buddhism",
  "Christianity",
  "Sikhism",
  "Other",
] as const;
export const EDUCATION_LEVELS = [
  "Primary",
  "Secondary",
  "Higher Secondary",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Professional Degree",
  "Other",
] as const;
export const PROFESSIONS = [
  "Student",
  "Teacher",
  "Engineer",
  "Doctor",
  "Business",
  "Government Service",
  "Private Service",
  "Lawyer",
  "Accountant",
  "IT Professional",
  "Freelancer",
  "Homemaker",
  "Other",
] as const;

export const HEIGHTS = [
  "4'10\" (147 cm)",
  "4'11\" (150 cm)",
  "5'0\" (152 cm)",
  "5'1\" (155 cm)",
  "5'2\" (157 cm)",
  "5'3\" (160 cm)",
  "5'4\" (163 cm)",
  "5'5\" (165 cm)",
  "5'6\" (168 cm)",
  "5'7\" (170 cm)",
  "5'8\" (173 cm)",
  "5'9\" (175 cm)",
  "5'10\" (178 cm)",
  "5'11\" (180 cm)",
  "6'0\" (183 cm)",
  "6'1\" (185 cm)",
  "6'2\" (188 cm)",
  "6'3\" (191 cm)",
] as const;

export const WEIGHTS = [
  "40-50 kg",
  "50-60 kg",
  "60-70 kg",
  "70-80 kg",
  "80-90 kg",
  "90-100 kg",
  "100+ kg",
] as const;

export const INCOME_RANGES = [
  "Below BDT 15,000",
  "BDT 15,000 - 25,000",
  "BDT 25,000 - 50,000",
  "BDT 50,000 - 75,000",
  "BDT 75,000 - 1,00,000",
  "BDT 1,00,000 - 2,00,000",
  "BDT 2,00,000+",
  "Prefer not to say",
] as const;

export const MOTHER_TONGUES = [
  "Bengali",
  "English",
  "Hindi",
  "Urdu",
  "Arabic",
  "Other",
] as const;

export const MARITAL_STATUSES = [
  "Never Married",
  "Divorced",
  "Widowed",
  "Awaiting Divorce",
] as const;

export const FAMILY_TYPES = ["Joint", "Nuclear"] as const;
export const FAMILY_STATUSES = ["Middle Class", "Upper Middle Class", "Rich", "Affluent"] as const;
export const FAMILY_VALUES = ["Orthodox", "Traditional", "Moderate", "Liberal", "Secular"] as const;

export const DIETS = ["Veg", "Non-Veg", "Eggetarian", "Vegan", "Jain", "Halal"] as const;

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const PROFILE_CREATED_BY_OPTIONS = ["Self", "Parent", "Sibling", "Relative", "Friend"] as const;

export const WORKING_WITH_OPTIONS = [
  "Government",
  "Private",
  "Business",
  "Self Employed",
  "Not Working",
  "Other",
] as const;

export const NATIONALITIES = [
  "Bangladeshi",
  "Indian",
  "Pakistani",
  "Sri Lankan",
  "Nepali",
  "Other",
] as const;

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "age-asc", label: "Age: Low to High" },
  { value: "age-desc", label: "Age: High to Low" },
  { value: "recently-active", label: "Recently Active" },
  { value: "profile-completeness", label: "Most Viewed" },
] as const;

export const ACTIVE_WITHIN_OPTIONS = [
  { value: "1", label: "Last 24 hours" },
  { value: "3", label: "Last 3 days" },
  { value: "7", label: "Last week" },
  { value: "30", label: "Last month" },
  { value: "90", label: "Last 3 months" },
] as const;
