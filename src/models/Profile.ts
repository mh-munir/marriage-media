import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  publicId?: string;
  // Basic Info
  email?: string;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  dateOfBirth: Date;
  age: number;
  height: string;
  weight: string;
  bloodGroup?: string;
  maritalStatus: "Never Married" | "Divorced" | "Widowed" | "Awaiting Divorce";
  profileCreatedBy: "Self" | "Parent" | "Sibling" | "Relative" | "Friend";

  // Religion & Culture
  religion: string;
  caste?: string;
  subCaste?: string;
  motherTongue: string;
  languages: string[];

  // Location
  country: string;
  division: string;
  district: string;
  thana: string;
  union: string;
  area: string;
  nationality: string;

  // Education & Career
  highestEducation: string;
  institution?: string;
  profession: string;
  workingWith?: string;
  company?: string;
  annualIncome?: string;

  // Family
  familyType: "Joint" | "Nuclear";
  familyStatus: "Middle Class" | "Upper Middle Class" | "Rich" | "Affluent";
  familyValues: "Orthodox" | "Traditional" | "Moderate" | "Liberal" | "Secular";
  fatherName?: string;
  fatherContactNumber?: string;
  fatherProfession?: string;
  motherName?: string;
  motherProfession?: string;
  numberOfSiblings?: number;
  siblingDetails?: string;
  siblings?: {
    name: string;
    relation: "Brother" | "Sister";
  }[];

  // Lifestyle
  diet: "Veg" | "Non-Veg" | "Eggetarian" | "Vegan" | "Jain" | "Halal" | "No Preference";
  smoke?: "Yes" | "No" | "Occasionally";
  drink?: "Yes" | "No" | "Occasionally";
  hobbies: string[];

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

  // Photos
  photos: {
    url: string;
    publicId: string;
    isPrimary: boolean;
    isApproved: boolean;
  }[];

  // Profile Settings
  showContactInfo: boolean;
  showHoroscope: boolean;
  isProfileBoosted: boolean;
  boostedAt?: Date;
  profileViews: number;
  lastViewedAt?: Date;

  // Premium
  isPremium: boolean;
  premiumExpiry?: Date;
  premiumPlan?: string;

  // Verification
  isVerified: boolean;
  verifiedAt?: Date;

  // Status
  isVisible: boolean;
  isDeactivated: boolean;
  lastActiveAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: [true, "Gender is required"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    age: {
      type: Number,
      required: true,
    },
    height: {
      type: String,
      required: [true, "Height is required"],
    },
    weight: {
      type: String,
      default: "",
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
      default: "",
    },
    maritalStatus: {
      type: String,
      enum: ["Never Married", "Divorced", "Widowed", "Awaiting Divorce"],
      required: [true, "Marital status is required"],
    },
    profileCreatedBy: {
      type: String,
      enum: ["Self", "Parent", "Sibling", "Relative", "Friend"],
      default: "Self",
    },

    religion: {
      type: String,
      required: [true, "Religion is required"],
    },
    caste: { type: String, default: "" },
    subCaste: { type: String, default: "" },
    motherTongue: { type: String, default: "" },
    languages: [{ type: String }],

    country: { type: String, default: "Bangladesh" },
    division: { type: String, default: "" },
    district: { type: String, default: "" },
    thana: { type: String, default: "" },
    union: { type: String, default: "" },
    area: { type: String, default: "" },
    nationality: { type: String, default: "Bangladeshi" },

    highestEducation: {
      type: String,
      required: [true, "Education level is required"],
    },
    institution: { type: String, default: "" },
    profession: {
      type: String,
      required: [true, "Profession is required"],
    },
    workingWith: { type: String, default: "" },
    company: { type: String, default: "" },
    annualIncome: { type: String, default: "" },

    familyType: {
      type: String,
      enum: ["Joint", "Nuclear"],
      default: "Nuclear",
    },
    familyStatus: {
      type: String,
      enum: ["Middle Class", "Upper Middle Class", "Rich", "Affluent"],
      default: "Middle Class",
    },
    familyValues: {
      type: String,
      enum: ["Orthodox", "Traditional", "Moderate", "Liberal", "Secular"],
      default: "Moderate",
    },
    fatherName: { type: String, default: "" },
    fatherContactNumber: { type: String, default: "" },
    fatherProfession: { type: String, default: "" },
    motherName: { type: String, default: "" },
    motherProfession: { type: String, default: "" },
    numberOfSiblings: { type: Number, default: 0 },
    siblingDetails: { type: String, default: "" },
    siblings: [
      {
        name: { type: String, trim: true, default: "" },
        relation: { type: String, enum: ["Brother", "Sister"], default: "Brother" },
      },
    ],

    diet: {
      type: String,
      enum: ["Veg", "Non-Veg", "Eggetarian", "Vegan", "Jain", "Halal", "No Preference"],
      default: "No Preference",
    },
    smoke: { type: String, enum: ["Yes", "No", "Occasionally"], default: "No" },
    drink: { type: String, enum: ["Yes", "No", "Occasionally"], default: "No" },
    hobbies: [{ type: String }],

    partnerPreference: { type: String, default: "", maxlength: [1000, "Partner preference cannot exceed 1000 characters"] },
    partnerPreferences: {
      age: { type: String, default: "" },
      height: { type: String, default: "" },
      weight: { type: String, default: "" },
      maritalStatus: { type: String, default: "" },
      religion: { type: String, default: "" },
      highestEducation: { type: String, default: "" },
      annualIncome: { type: String, default: "" },
      country: { type: String, default: "" },
      division: { type: String, default: "" },
      district: { type: String, default: "" },
      thana: { type: String, default: "" },
      union: { type: String, default: "" },
      area: { type: String, default: "" },
      familyType: { type: String, default: "" },
      familyStatus: { type: String, default: "" },
      familyValues: { type: String, default: "" },
    },

    photos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: false },
      },
    ],

    showContactInfo: { type: Boolean, default: false },
    showHoroscope: { type: Boolean, default: false },
    isProfileBoosted: { type: Boolean, default: false },
    boostedAt: { type: Date },
    profileViews: { type: Number, default: 0 },
    lastViewedAt: { type: Date },

    isPremium: { type: Boolean, default: false },
    premiumExpiry: { type: Date },
    premiumPlan: { type: String, default: "" },

    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },

    isVisible: { type: Boolean, default: false },
    isDeactivated: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for search optimization
ProfileSchema.index({ gender: 1, isVisible: 1, isDeactivated: 1 });
ProfileSchema.index({ age: 1 });
ProfileSchema.index({ religion: 1 });
ProfileSchema.index({ profession: 1 });
ProfileSchema.index({ country: 1, division: 1, district: 1 });
ProfileSchema.index({ highestEducation: 1 });
ProfileSchema.index({ isPremium: 1, premiumExpiry: 1 });
ProfileSchema.index({ isVerified: 1 });
ProfileSchema.index({ isProfileBoosted: 1, boostedAt: -1 });
ProfileSchema.index({ lastActiveAt: -1 });
ProfileSchema.index({ "photos.isPrimary": 1, "photos.isApproved": 1 });

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);

export default Profile;