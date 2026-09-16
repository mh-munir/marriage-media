"use client";

import * as React from "react";

export type Language = "bn" | "en";

type TranslationKey =
  | "home"
  | "about"
  | "pricing"
  | "blog"
  | "successStories"
  | "contact"
  | "dashboard"
  | "search"
  | "interests"
  | "messages"
  | "favorites"
  | "login"
  | "logout"
  | "toggleLanguage"
  | "registerFree"
  | "goToDashboard"
  | "seeSuccessStories"
  | "profile"
  | "whoViewedMe"
  | "blockedUsers"
  | "verification"
  | "analytics"
  | "notifications"
  | "settings"
  | "adminPanel"
  | "toggleTheme"
  | "openNotifications"
  | "toggleMenu"
  | "homeEyebrow"
  | "homeTitle"
  | "homeDescription"
  | "verifiedProfiles"
  | "activeMembers"
  | "memberRating"
  | "privacyFocused"
  | "betterWay"
  | "builtForReal"
  | "noEndlessNoise"
  | "trustFirst"
  | "smarterRecommendations"
  | "madeForCommitment"
  | "meetCommunity"
  | "peopleWorthKnowing"
  | "communityDescription"
  | "joinMarriageMedia"
  | "howItWorks"
  | "threeSteps"
  | "tellStory"
  | "discoverMatch"
  | "startSomethingReal";

const translations: Record<Language, Record<TranslationKey, string>> = {
  bn: {
    home: "হোম",
    about: "আমাদের সম্পর্কে",
    pricing: "মূল্য তালিকা",
    blog: "ব্লগ",
    successStories: "সফলতার গল্প",
    contact: "যোগাযোগ",
    dashboard: "ড্যাশবোর্ড",
    search: "খুঁজুন",
    interests: "আগ্রহ",
    messages: "বার্তা",
    favorites: "পছন্দের তালিকা",
    login: "লগইন",
    logout: "লগআউট",
    toggleLanguage: "ভাষা পরিবর্তন করুন",
    registerFree: "বিনামূল্যে নিবন্ধন",
    goToDashboard: "ড্যাশবোর্ডে যান",
    seeSuccessStories: "সফলতার গল্প দেখুন",
    profile: "প্রোফাইল",
    whoViewedMe: "কে আমাকে দেখেছে",
    blockedUsers: "ব্লক করা ব্যবহারকারী",
    verification: "যাচাইকরণ",
    analytics: "বিশ্লেষণ",
    notifications: "নোটিফিকেশন",
    settings: "সেটিংস",
    adminPanel: "অ্যাডমিন প্যানেল",
    toggleTheme: "থিম পরিবর্তন করুন",
    openNotifications: "নোটিফিকেশন খুলুন",
    toggleMenu: "মেনু খুলুন বা বন্ধ করুন",
    homeEyebrow: "অর্থপূর্ণ সম্পর্ক, আরও সহজভাবে",
    homeTitle: "এমন একজনকে খুঁজুন, যার কাছে ঘরের মতো লাগে।",
    homeDescription: "Marriage Media আপনাকে thoughtful matching, যাচাইকৃত প্রোফাইল এবং গুরুত্বপূর্ণ কথোপকথনের মাধ্যমে জীবনসঙ্গী খুঁজে পেতে সাহায্য করে।",
    verifiedProfiles: "যাচাইকৃত প্রোফাইল",
    activeMembers: "সক্রিয় সদস্য",
    memberRating: "সদস্যদের রেটিং",
    privacyFocused: "গোপনীয়তাকে অগ্রাধিকার",
    betterWay: "পরিচিত হওয়ার আরও ভালো উপায়",
    builtForReal: "বাস্তব সম্পর্কের জন্য তৈরি",
    noEndlessNoise: "অযথা কোলাহল নয়। অর্থপূর্ণ সম্পর্কের জন্য প্রস্তুত মানুষদের একটি নিরাপদ জায়গা।",
    trustFirst: "বিশ্বাস সবার আগে",
    smarterRecommendations: "আরও বুদ্ধিমান সুপারিশ",
    madeForCommitment: "প্রতিশ্রুতির জন্য তৈরি",
    meetCommunity: "কমিউনিটির সঙ্গে পরিচিত হন",
    peopleWorthKnowing: "যাদের জানার মতো গল্প আছে",
    communityDescription: "প্রতিটি প্রোফাইল একজন মানুষ, যার নিজের গল্প, পরিবার এবং ভবিষ্যতের স্বপ্ন আছে। একটি শুভেচ্ছা দিয়ে শুরু করুন।",
    joinMarriageMedia: "Marriage Media-তে যোগ দিন",
    howItWorks: "এটি যেভাবে কাজ করে",
    threeSteps: "আপনার নতুন অধ্যায়ের পথে তিনটি ধাপ",
    tellStory: "আপনার গল্প বলুন",
    discoverMatch: "আপনার মিল খুঁজে নিন",
    startSomethingReal: "বাস্তব কিছু শুরু করুন",
  },
  en: {
    home: "Home",
    about: "About",
    pricing: "Pricing",
    blog: "Blog",
    successStories: "Success Stories",
    contact: "Contact",
    dashboard: "Dashboard",
    search: "Search",
    interests: "Interests",
    messages: "Messages",
    favorites: "Favorites",
    login: "Login",
    logout: "Logout",
    toggleLanguage: "Change language",
    registerFree: "Register Free",
    goToDashboard: "Go to Dashboard",
    seeSuccessStories: "See success stories",
    profile: "Profile",
    whoViewedMe: "Who Viewed Me",
    blockedUsers: "Blocked Users",
    verification: "Verification",
    analytics: "Analytics",
    notifications: "Notifications",
    settings: "Settings",
    adminPanel: "Admin Panel",
    toggleTheme: "Toggle theme",
    openNotifications: "Open notifications",
    toggleMenu: "Toggle navigation menu",
    homeEyebrow: "Meaningful connections, made simpler",
    homeTitle: "Meet someone who feels like home.",
    homeDescription: "Marriage Media helps you find a genuine life partner through thoughtful matching, verified profiles, and conversations that matter.",
    verifiedProfiles: "Verified profiles",
    activeMembers: "active members",
    memberRating: "member rating",
    privacyFocused: "privacy focused",
    betterWay: "A better way to meet",
    builtForReal: "Built for something real.",
    noEndlessNoise: "No endless noise. Just a warm, trusted space for people who are ready for a meaningful relationship.",
    trustFirst: "Trust comes first",
    smarterRecommendations: "Smarter recommendations",
    madeForCommitment: "Made for commitment",
    meetCommunity: "Meet the community",
    peopleWorthKnowing: "People worth getting to know.",
    communityDescription: "Every profile is a person with a story, a family, and hopes for the future. Start with a hello.",
    joinMarriageMedia: "Join Marriage Media",
    howItWorks: "How it works",
    threeSteps: "Three steps to your next chapter.",
    tellStory: "Tell us your story",
    discoverMatch: "Discover your match",
    startSomethingReal: "Start something real",
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  translateText: (text: string) => string;
}

const biodataText: Record<string, string> = {
  "About Us": "আমাদের সম্পর্কে",
  "Contact": "যোগাযোগ",
  "Blog": "ব্লগ",
  "Success Stories": "সফলতার গল্প",
  "Careers": "ক্যারিয়ার",
  "Help Center": "সহায়তা কেন্দ্র",
  "Safety Tips": "নিরাপত্তা পরামর্শ",
  "Report Abuse": "অপব্যবহার রিপোর্ট করুন",
  "FAQ": "সাধারণ জিজ্ঞাসা",
  "Privacy Policy": "গোপনীয়তা নীতি",
  "Terms & Conditions": "শর্তাবলি",
  "Refund Policy": "রিফান্ড নীতি",
  "Cookie Policy": "কুকি নীতি",
  "Premium Features": "প্রিমিয়াম সুবিধা",
  "Pricing": "মূল্য তালিকা",
  "Premium": "প্রিমিয়াম",
  "The best love stories start with a conversation.": "সেরা ভালোবাসার গল্প একটি কথোপকথন দিয়েই শুরু হয়।",
  "Read member stories": "সদস্যদের গল্প পড়ুন",
  "Start today": "আজই শুরু করুন",
  "A thoughtful beginning can change everything.": "একটি সুন্দর শুরু সবকিছু বদলে দিতে পারে।",
  "Join a growing community of people looking for a partner, not just another profile.": "শুধু আরেকটি প্রোফাইল নয়, জীবনসঙ্গী খুঁজছেন এমন মানুষের ক্রমবর্ধমান কমিউনিটিতে যোগ দিন।",
  "Find your match": "আপনার মিল খুঁজে নিন",
  "Company": "কোম্পানি",
  "Support": "সহায়তা",
  "Legal": "আইনি তথ্য",
  "Bangladesh's most trusted matrimony platform. Find your perfect life partner with advanced matching and verified profiles.": "বাংলাদেশের সবচেয়ে বিশ্বস্ত বিবাহ প্ল্যাটফর্ম। উন্নত ম্যাচিং ও যাচাইকৃত প্রোফাইলের মাধ্যমে আপনার জীবনসঙ্গী খুঁজে নিন।",
  "All rights reserved.": "সর্বস্বত্ব সংরক্ষিত।",
  "Made with": "তৈরি হয়েছে",
  "in Bangladesh": "বাংলাদেশে",
  "Basic Information": "মৌলিক তথ্য",
  "Family Information": "পারিবারিক তথ্য",
  "Location Information": "ঠিকানার তথ্য",
  "Education": "শিক্ষা",
  "About Me": "আমার সম্পর্কে",
  "Images": "ছবি",
  "Expected Partner": "প্রত্যাশিত জীবনসঙ্গী",
  "Confirmation": "নিশ্চিতকরণ",
  "Guardian": "অভিভাবক",
  "Guardian Name": "অভিভাবকের নাম",
  "Guardian Mobile Number": "অভিভাবকের মোবাইল নম্বর",
  "Select": "নির্বাচন করুন",
  "Country": "দেশ",
  "Present Address": "বর্তমান ঠিকানা",
  "Permanent Address": "স্থায়ী ঠিকানা",
  "Area": "এলাকা",
  "Thana": "থানা",
  "Union": "ইউনিয়ন",
  "Institute Name": "প্রতিষ্ঠানের নাম",
  "Year": "বছর",
  "Write about yourself": "নিজের সম্পর্কে লিখুন",
  "Upload photos (1-4)": "ছবি আপলোড করুন (১–৪টি)",
  "Expected partner": "প্রত্যাশিত জীবনসঙ্গী",
  "Previous step": "আগের ধাপ",
  "Complete": "সম্পন্ন করুন",
  "Next": "পরবর্তী",
  "Loading...": "লোড হচ্ছে...",
  "Please log in.": "অনুগ্রহ করে লগইন করুন।",
  "Please complete all required fields in this step.": "এই ধাপের সব বাধ্যতামূলক তথ্য পূরণ করুন।",
  "Permanent Address Division and District are required.": "স্থায়ী ঠিকানার বিভাগ ও জেলা নির্বাচন করুন।",
  "Enter an 11-digit guardian mobile number.": "অভিভাবকের ১১ সংখ্যার মোবাইল নম্বর দিন।",
  "Upload at least one photo.": "কমপক্ষে একটি ছবি আপলোড করুন।",
  "Choose at least one partner preference.": "প্রত্যাশিত জীবনসঙ্গীর অন্তত একটি পছন্দ দিন।",
  "Please accept the declaration.": "দায় স্বীকারের checkbox নির্বাচন করুন।",
  "Unable to save.": "সংরক্ষণ করা যায়নি।",
  "Saving...": "সংরক্ষণ হচ্ছে...",
  "Upload failed": "আপলোড ব্যর্থ হয়েছে",
  "Maximum 4 photos allowed.": "সর্বোচ্চ ৪টি ছবি দেওয়া যাবে।",
  "Father Name": "বাবার নাম",
  "Mother Name": "মায়ের নাম",
  "Present location: select Division, District, Thana and Union below.": "বর্তমান ঠিকানার জন্য নিচের বিভাগ, জেলা, থানা ও ইউনিয়ন নির্বাচন করুন।",
  "Declarations": "ঘোষণা",
  "Yes": "হ্যাঁ",
  "No": "না",
  "My family knows that I am submitting this biodata.": "আপনার পরিবার এই বায়োডাটার বিষয়ে জানে কি?",
  "I confirm before Allah that all information is accurate.": "আল্লাহকে সাক্ষী রেখে আমি সব তথ্য সঠিক দিয়েছি।",
  "I declare before Allah that all information is accurate.": "আল্লাহকে সাক্ষী রেখে বলুন আপনার সব তথ্য সঠিক।",
  "I accept legal and religious responsibility for false information.": "আমি মিথ্যা তথ্য দিলে দুনিয়াবি আইনগত শাস্তি ও আখিরাতের দায় আমার।",
  "First Name": "নামের প্রথম অংশ",
  "Last Name": "নামের শেষ অংশ",
  "Email (Optional)": "ইমেইল (ঐচ্ছিক)",
  "Mobile Number": "মোবাইল নম্বর",
  "Father's Name": "বাবার নাম",
  "Father's Contact Number": "বাবার মোবাইল নম্বর",
  "Mother's Name": "মায়ের নাম",
  "Family Type": "পরিবারের ধরন",
  "Family Status": "পরিবারের অবস্থা",
  "Family Values": "পারিবারিক মূল্যবোধ",
  "Brothers and Sisters": "ভাই-বোন",
  "Education & Career": "শিক্ষা ও পেশা",
  "Complete Your Profile": "আপনার প্রোফাইল সম্পূর্ণ করুন",
  "Save Changes": "পরিবর্তন সংরক্ষণ করুন",
  "Reset": "রিসেট",
  "Any age": "যেকোনো বয়স",
  "Any height": "যেকোনো উচ্চতা",
  "Any weight": "যেকোনো ওজন",
  "Any status": "যেকোনো অবস্থা",
  "Any religion": "যেকোনো ধর্ম",
  "Any education": "যেকোনো শিক্ষা",
  "Password": "পাসওয়ার্ড",
  "Confirm Password": "পাসওয়ার্ড নিশ্চিত করুন",
  "Remember me": "আমাকে মনে রাখুন",
  "Forgot password?": "পাসওয়ার্ড ভুলে গেছেন?",
  "Sign In": "লগইন করুন",
  "Sign in": "লগইন",
  "Register free": "বিনামূল্যে নিবন্ধন",
  "Profile Photos": "প্রোফাইলের ছবি",
  "Profile photo private": "প্রোফাইলের ছবি ব্যক্তিগত",
  "Photos are hidden for privacy.": "গোপনীয়তার জন্য ছবি লুকানো আছে।",
  "Photos are not shown on the public home page.": "ছবি পাবলিক হোম পেজে দেখানো হয় না।",
  "ID pending": "আইডি অপেক্ষমাণ",
  "Profile shared": "প্রোফাইল শেয়ারকৃত",
  "Location not added": "লোকেশন যোগ করা হয়নি",
  "Marriage Media Member": "Marriage Media সদস্য",
  "yrs": "বছর",
  "Verified": "যাচাইকৃত",
  "New": "নতুন",
  "View profile": "প্রোফাইল দেখুন",
  "views": "ভিউ",
  "User Profile": "ব্যবহারকারীর প্রোফাইল",
  "Profile Gallery": "প্রোফাইল গ্যালারি",
  "Photos are hidden": "ছবি লুকানো আছে",
  "Subscribe to Premium to view photos": "ছবি দেখতে প্রিমিয়াম সাবস্ক্রাইব করুন",
  "Subscribe to Premium to view full profile images.": "সম্পূর্ণ প্রোফাইল ছবি দেখতে প্রিমিয়াম সাবস্ক্রাইব করুন।",
  "Upgrade Now": "এখনই আপগ্রেড করুন",
  "Premium Feature": "প্রিমিয়াম ফিচার",
  "No uploaded photos": "কোনও আপলোড করা ছবি নেই",
  "No member profiles are available right now.": "এখন কোনও সদস্যের প্রোফাইল উপলব্ধ নেই।",
  "photo": "ছবি",
  "photos": "ছবি",
  "Back to search": "খুঁজতে ফিরে যান",
  "BIODATA": "বায়োডাটা",
  "Personal Details": "ব্যক্তিগত তথ্য",
  "Contact Details": "যোগাযোগের তথ্য",
  "Family Details": "পরিবারের তথ্য",
  "Name": "নাম",
  "Age": "বয়স",
  "Gender": "লিঙ্গ",
  "Marital Status": "বৈবাহিক অবস্থা",
  "Profile Created By": "প্রোফাইল তৈরি করেছেন",
  "Religion": "ধর্ম",
  "Caste": "জাতি/কাস্ট",
  "Sub-caste": "উপ-জাতি",
  "Mother Tongue": "মাতৃভাষা",
  "Languages": "ভাষা",
  "Nationality": "জাতীয়তা",
  "Blood Group": "রক্তের গ্রুপ",
  "Email": "ইমেইল",
  "Contact Number": "কন্টাক্ট নম্বর",
  "Working With": "যে প্রতিষ্ঠানে কাজ করছেন",
  "Father's Contact": "বাবার কন্টাক্ট",
  "Father's Profession": "বাবার পেশা",
  "Mother's Profession": "মায়ের পেশা",
  "Siblings": "ভাই-বোন",
  "Upload at least 2 and up to 5 images.": "কমপক্ষে ২টি এবং সর্বোচ্চ ৫টি ছবি আপলোড করুন।",
  "Add images": "ছবি যোগ করুন",
  "Uploading": "আপলোড হচ্ছে",
  "Relation": "সম্পর্ক",
  "No brothers or sisters added.": "কোনো ভাই বা বোন যোগ করা হয়নি।",
  "Tell us about the partner you are looking for.": "আপনি কেমন জীবনসঙ্গী খুঁজছেন তা জানান।",
  "Complete your profile to get better matches.": "ভালো মিল পেতে আপনার প্রোফাইল সম্পূর্ণ করুন।",
  "Welcome Back": "আবারও স্বাগতম",
  "Sign in to continue your journey": "আপনার যাত্রা চালিয়ে যেতে লগইন করুন",
  "Enter your password": "আপনার পাসওয়ার্ড লিখুন",
  "Don't have an account?": "অ্যাকাউন্ট নেই?",
  "Account created successfully! Please sign in.": "অ্যাকাউন্ট তৈরি হয়েছে! অনুগ্রহ করে লগইন করুন।",
  "Islam": "ইসলাম",
  "Hinduism": "হিন্দুধর্ম",
  "Buddhism": "বৌদ্ধধর্ম",
  "Christianity": "খ্রিস্টধর্ম",
  "Sikhism": "শিখধর্ম",
  "Other": "অন্যান্য",
  "Primary": "প্রাথমিক",
  "Secondary": "মাধ্যমিক",
  "Higher Secondary": "উচ্চ মাধ্যমিক",
  "Diploma": "ডিপ্লোমা",
  "Bachelor's Degree": "স্নাতক ডিগ্রি",
  "Master's Degree": "স্নাতকোত্তর ডিগ্রি",
  "PhD": "পিএইচডি",
  "Professional Degree": "পেশাগত ডিগ্রি",
  "Student": "শিক্ষার্থী",
  "Teacher": "শিক্ষক",
  "Engineer": "প্রকৌশলী",
  "Doctor": "চিকিৎসক",
  "Business": "ব্যবসা",
  "Government Service": "সরকারি চাকরি",
  "Private Service": "বেসরকারি চাকরি",
  "Lawyer": "আইনজীবী",
  "Accountant": "হিসাবরক্ষক",
  "IT Professional": "আইটি পেশাজীবী",
  "Freelancer": "ফ্রিল্যান্সার",
  "Homemaker": "গৃহিণী/গৃহকর্তা",
  "Prefer not to say": "জানাতে অনিচ্ছুক",
  "Any family type": "যেকোনো পরিবারের ধরন",
  "Any family status": "যেকোনো পারিবারিক অবস্থা",
  "Any family values": "যেকোনো পারিবারিক মূল্যবোধ",
  "Saved!": "সংরক্ষিত হয়েছে!",
  "Add sibling": "ভাই/বোন যোগ করুন",
  "Remove": "বাদ দিন",
  "Date of Birth": "জন্ম তারিখ",
  "Height": "উচ্চতা",
  "Weight": "ওজন",
  "Male": "পুরুষ",
  "Female": "নারী",
  "Never Married": "অবিবাহিত",
  "Divorced": "তালাকপ্রাপ্ত",
  "Widowed": "বিধবা/বিপত্নীক",
  "Awaiting Divorce": "তালাকের অপেক্ষায়",
  "Joint": "যৌথ পরিবার",
  "Nuclear": "একক পরিবার",
  "Middle Class": "মধ্যবিত্ত",
  "Upper Middle Class": "উচ্চ মধ্যবিত্ত",
  "Rich": "সম্পদশালী",
  "Affluent": "অত্যন্ত স্বচ্ছল",
  "Orthodox": "রক্ষণশীল",
  "Traditional": "ঐতিহ্যবাহী",
  "Moderate": "মধ্যপন্থী",
  "Liberal": "উদারপন্থী",
  "Secular": "ধর্মনিরপেক্ষ",
  "Brother": "ভাই",
  "Sister": "বোন",
  "Select division": "বিভাগ নির্বাচন করুন",
  "Select district": "জেলা নির্বাচন করুন",
  "Select thana": "থানা নির্বাচন করুন",
  "Select union": "ইউনিয়ন নির্বাচন করুন",
  "Select division first": "আগে বিভাগ নির্বাচন করুন",
  "Select district first": "আগে জেলা নির্বাচন করুন",
  "Select thana first": "আগে থানা নির্বাচন করুন",
  "Bangladesh": "বাংলাদেশ",
  "Bengali": "বাংলা",
  "Married": "বিবাহিত",
  "Father": "বাবা",
  "Mother": "মা",
  "Veg": "নিরামিষভোজী",
  "Non-Veg": "আমিষভোজী",
  "Eggetarian": "ডিম-নিরামিষভোজী",
  "Vegan": "ভেগান",
  "Jain": "জৈন",
  "Halal": "হালাল",
  "No Preference": "কোনও পছন্দ নেই",
  "Occasionally": "মাঝেমধ্যে",
  "Smoking": "ধূমপান",
  "Drinking": "মদ্যপান",
  "Lifestyle Details": "জীবনযাপনের তথ্য",
  "Preference": "পছন্দ",
  "Highest Education": "সর্বোচ্চ শিক্ষা",
  "Institution": "প্রতিষ্ঠান",
  "Annual Income": "বার্ষিক আয়",
  "Present Location": "বর্তমান ঠিকানা",
};

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Keep the first client render identical to the server render. Reading
  // localStorage during state initialization caused the header language to
  // differ while React was hydrating.
  const [language, setLanguageState] = React.useState<Language>("bn");
  const [hasHydrated, setHasHydrated] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("marriage-media-language");
    queueMicrotask(() => {
      if (saved === "en") setLanguageState("en");
      setHasHydrated(true);
    });
  }, []);

  React.useEffect(() => {
    if (!hasHydrated) return;
    localStorage.setItem("marriage-media-language", language);
    document.documentElement.lang = language;
  }, [hasHydrated, language]);

  const setLanguage = React.useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
  }, []);

  const toggleLanguage = React.useCallback(() => {
    setLanguageState((current) => (current === "bn" ? "en" : "bn"));
  }, []);

  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: (key: TranslationKey) => translations[language][key],
      translateText: (text: string) => {
        if (language === "bn") return biodataText[text] || text;
        const englishText = Object.entries(biodataText).find(([, bengali]) => bengali === text)?.[0];
        return englishText || text;
      },
    }),
    [language, setLanguage, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
