import { z } from "zod";

// ==================== Auth Validations ====================

export const registerSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9][0-9]{8}$/, "Mobile number must be exactly 11 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9][0-9]{8}$/, "Mobile number must be exactly 11 digits"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  phone: z.string().trim().regex(/^01[3-9][0-9]{8}$/, "Mobile number must be exactly 11 digits"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ==================== Profile Validations ====================

export const profileBasicSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  gender: z.enum(["Male", "Female"], { message: "Gender is required" }),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  height: z.string().min(1, "Height is required"),
  weight: z.string().optional(),
  bloodGroup: z.string().optional(),
  maritalStatus: z.enum(["Never Married", "Divorced", "Widowed", "Awaiting Divorce"], {
    message: "Marital status is required",
  }),
  profileCreatedBy: z.enum(["Self", "Parent", "Sibling", "Relative", "Friend"]).optional(),
});

export const profileReligionSchema = z.object({
  religion: z.string().min(1, "Religion is required"),
  caste: z.string().optional(),
  subCaste: z.string().optional(),
  motherTongue: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

export const profileLocationSchema = z.object({
  country: z.string().min(1, "Country is required"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  area: z.string().optional(),
  nationality: z.string().min(1, "Nationality is required"),
});

export const profileEducationSchema = z.object({
  highestEducation: z.string().optional(),
  institution: z.string().optional(),
  profession: z.string().optional(),
  workingWith: z.string().optional(),
  company: z.string().optional(),
  annualIncome: z.string().optional(),
});

export const profileFamilySchema = z.object({
  familyType: z.enum(["Joint", "Nuclear"]).optional(),
  familyStatus: z.enum(["Middle Class", "Upper Middle Class", "Rich", "Affluent"]).optional(),
  familyValues: z.enum(["Orthodox", "Traditional", "Moderate", "Liberal", "Secular"]).optional(),
  fatherName: z.string().optional(),
  fatherContactNumber: z.string().optional(),
  fatherProfession: z.string().optional(),
  motherName: z.string().optional(),
  motherProfession: z.string().optional(),
  numberOfSiblings: z.number().min(0).max(20).optional(),
  siblingDetails: z.string().optional(),
  siblings: z.array(z.object({
    name: z.string().optional(),
    relation: z.enum(["Brother", "Sister"]),
  })).optional(),
});

export const profileLifestyleSchema = z.object({
  diet: z.enum(["Veg", "Non-Veg", "Eggetarian", "Vegan", "Jain", "Halal", "No Preference"]).optional(),
});

export const profileAboutSchema = z.object({
  partnerPreference: z.string().max(1000).optional(),
});

// ==================== Interest Validation ====================

export const sendInterestSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
  message: z.string().max(500).optional(),
});

export const updateInterestSchema = z.object({
  status: z.enum(["accepted", "rejected", "cancelled"]),
});

// ==================== Message Validation ====================

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  receiverId: z.string().min(1, "Receiver ID is required"),
  content: z.string().min(1, "Message cannot be empty").max(5000),
  messageType: z.enum(["text", "image", "emoji"]).default("text"),
  imageUrl: z.string().optional(),
});

// ==================== Blog Validation ====================

export const blogSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required").max(500),
  category: z.string().default("General"),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
});

// ==================== Report Validation ====================

export const reportUserSchema = z.object({
  reportedUserId: z.string().min(1, "User ID is required"),
  reason: z.enum(["fake_profile", "inappropriate_content", "harassment", "spam", "other"]),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
});

// ==================== Payment Validation ====================

export const paymentSchema = z.object({
  plan: z.enum(["monthly", "quarterly", "half-yearly", "yearly"]),
  paymentMethod: z.enum(["sslcommerz", "bkash", "nagad", "stripe"]),
  billingInfo: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

// ==================== Settings Validation ====================

export const updateSettingsSchema = z.object({
  showContactInfo: z.boolean().optional(),
  showHoroscope: z.boolean().optional(),
  isVisible: z.boolean().optional(),
});

// ==================== Admin Settings ====================

export const adminUserUpdateSchema = z.object({
  role: z.enum(["user", "admin", "superadmin"]).optional(),
  isActive: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
});