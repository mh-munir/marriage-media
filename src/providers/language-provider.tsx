"use client";

import * as React from "react";
import { registerLocationLabels } from "@/lib/location-labels";

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
    homeDescription: "Marriage Media আপনাকে যত্নশীল ম্যাচিং, যাচাইকৃত প্রোফাইল এবং গুরুত্বপূর্ণ কথোপকথনের মাধ্যমে জীবনসঙ্গী খুঁজে পেতে সাহায্য করে।",
    verifiedProfiles: "যাচাইকৃত প্রোফাইল",
    activeMembers: "সক্রিয় সদস্য",
    memberRating: "সদস্যদের রেটিং",
    privacyFocused: "গোপনীয়তাকে অগ্রাধিকার",
    betterWay: "পরিচিত হওয়ার আরও ভালো উপায়",
    builtForReal: "বাস্তব সম্পর্কের জন্য তৈরি",
    noEndlessNoise: "অযথা কোলাহল নয়। অর্থপূর্ণ সম্পর্কের জন্য প্রস্তুত মানুষদের একটি নিরাপদ জায়গা।",
    trustFirst: "বিশ্বাস সবার আগে",
    smarterRecommendations: "আরও বুদ্ধিমান পরামর্শ",
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
  "there": "আপনি",
  "Welcome back": "আবারও স্বাগতম",
  "Here's what's happening with your profile today.": "আজ আপনার প্রোফাইলে কী ঘটছে, তার সংক্ষিপ্তসার এখানে।",
  "Edit Profile": "প্রোফাইল সম্পাদনা করুন",
  "Profile Views": "প্রোফাইল দেখা হয়েছে",
  "Interests Received": "প্রাপ্ত আগ্রহ",
  "Unread Alerts": "অপঠিত সতর্কতা",
  "Unread Messages": "অপঠিত বার্তা",
  "Complete your profile": "আপনার প্রোফাইল সম্পূর্ণ করুন",
  "Profiles with 100% completion get more visibility and better match suggestions.": "১০০% সম্পূর্ণ প্রোফাইল বেশি মানুষের কাছে পৌঁছায় এবং ভালো মিলের পরামর্শ পাওয়া যায়।",
  "Complete Profile": "প্রোফাইল সম্পূর্ণ করুন",
  "AI Recommended Matches": "এআই প্রস্তাবিত মিল",
  "View All": "সব দেখুন",
  "Add your Expected partner preferences to see profiles with more than 50% matches.": "৫০%-এর বেশি মিলের প্রোফাইল দেখতে প্রত্যাশিত জীবনসঙ্গীর পছন্দগুলো যোগ করুন।",
  "Quick Actions": "দ্রুত কাজ",
  "Search Profiles": "প্রোফাইল খুঁজুন",
  "View Interests": "আগ্রহ দেখুন",
  "Messages": "বার্তা",
  "Favorites": "পছন্দের তালিকা",
  "Go Premium": "প্রিমিয়ামে যান",
  "Unlock unlimited interests, chat, and AI matching to find your partner faster.": "দ্রুত জীবনসঙ্গী খুঁজতে সীমাহীন আগ্রহ, চ্যাট এবং এআই ম্যাচিং চালু করুন।",
  "Browse Profiles": "প্রোফাইল দেখুন",
  "Discover Matches": "মিল খুঁজুন",
  "Browse live profiles from the database and view your recent profile history.": "ডেটাবেসের সক্রিয় প্রোফাইল দেখুন এবং আপনার সাম্প্রতিক প্রোফাইল ইতিহাস দেখুন।",
  "Browse": "ব্রাউজ",
  "Recent": "সাম্প্রতিক",
  "Infinite scroll": "স্বয়ংক্রিয় স্ক্রল",
  "All Education": "সব শিক্ষাগত যোগ্যতা",
  "Premium only": "শুধু প্রিমিয়াম",
  "Loading profiles...": "প্রোফাইল লোড হচ্ছে...",
  "Showing": "দেখানো হচ্ছে",
  "of": "এর মধ্যে",
  "profiles": "টি প্রোফাইল",
  "Refresh": "রিফ্রেশ",
  "Page": "পৃষ্ঠা",
  "No profiles found": "কোনো প্রোফাইল পাওয়া যায়নি",
  "No recently viewed profiles": "সাম্প্রতিক দেখা কোনো প্রোফাইল নেই",
  "There are no profiles available right now.": "এই মুহূর্তে কোনো প্রোফাইল পাওয়া যাচ্ছে না।",
  "Profiles you view from Browse Profiles will appear here.": "ব্রাউজ প্রোফাইল থেকে দেখা প্রোফাইলগুলো এখানে দেখা যাবে।",
  "Best Match": "সেরা মিল",
  "Recently Active": "সম্প্রতি সক্রিয়",
  "Newest Members": "নতুন সদস্য",
  "Age: Low to High": "বয়স: কম থেকে বেশি",
  "Age: High to Low": "বয়স: বেশি থেকে কম",
  "Premium First": "প্রিমিয়াম আগে",
  "Verified First": "যাচাইকৃত আগে",
  "Most Viewed": "সবচেয়ে বেশি দেখা",
  "Find Your Perfect Plan": "আপনার জন্য সেরা প্ল্যান খুঁজুন",
  "Choose the plan that suits your journey to finding your life partner. Start free and upgrade when you're ready.": "জীবনসঙ্গী খোঁজার যাত্রায় আপনার উপযুক্ত প্ল্যান বেছে নিন। বিনামূল্যে শুরু করুন এবং প্রস্তুত হলে আপগ্রেড করুন।",
  "Why Upgrade?": "কেন আপগ্রেড করবেন?",
  "Send and receive unlimited messages with your matches.": "আপনার ম্যাচদের সঙ্গে সীমাহীন বার্তা পাঠান ও গ্রহণ করুন।",
  "AI Matching": "এআই ম্যাচিং",
  "Get personalized match recommendations powered by AI.": "এআই-এর মাধ্যমে ব্যক্তিগতকৃত ম্যাচের পরামর্শ পান।",
  "View Contact Info": "যোগাযোগের তথ্য দেখুন",
  "Access phone numbers and email addresses of your matches.": "আপনার ম্যাচদের ফোন নম্বর ও ইমেইল ঠিকানা দেখুন।",
  "Profile Boost": "প্রোফাইল বুস্ট",
  "Get 10x more profile views with monthly profile boosts.": "মাসিক প্রোফাইল বুস্টে ১০ গুণ বেশি ভিউ পান।",
  "Go Gold": "গোল্ড নিন",
  "Get Started Free": "বিনামূল্যে শুরু করুন",
  "Article": "প্রবন্ধ",
  "Story": "গল্প",
  "Inspire": "অনুপ্রেরণা দেয়",
  "Open": "খুলুন",
  "fullscreen": "পূর্ণ পর্দায়",
  "success story image": "সাফল্যের গল্পের ছবি",
  "Success story": "সাফল্যের গল্প",
  "Published from the live blog feed": "লাইভ ব্লগ ফিড থেকে প্রকাশিত",
  "Basic": "বেসিক",
  "Gold": "গোল্ড",
  "forever": "চিরকাল",
  "/month": "/মাস",
  "Create Profile": "প্রোফাইল তৈরি করুন",
  "Basic Search": "বেসিক সার্চ",
  "5 Interests per day": "প্রতিদিন ৫টি আগ্রহ",
  "Save Favorites": "পছন্দের তালিকায় সংরক্ষণ",
  "View Profile Photos": "প্রোফাইলের ছবি দেখুন",
  "Everything in Premium": "প্রিমিয়ামের সব সুবিধা",
  "Top Search Results": "সার্চের শীর্ষ ফলাফল",
  "Profile Highlight": "প্রোফাইল হাইলাইট",
  "Dedicated Matchmaker": "নির্দিষ্ট ম্যাচমেকার",
  "Profile Boost (3x/month)": "প্রোফাইল বুস্ট (মাসে ৩ বার)",
  "VIP Support": "ভিআইপি সহায়তা",
  "Unlimited Interests": "সীমাহীন আগ্রহ",
  "Unlimited Chat": "সীমাহীন চ্যাট",
  "AI Match Recommendations": "এআই ম্যাচের পরামর্শ",
  "Profile Boost (1x/month)": "প্রোফাইল বুস্ট (মাসে ১ বার)",
  "See Who Viewed You": "কে আপনাকে দেখেছে দেখুন",
  "Featured Badge": "ফিচার্ড ব্যাজ",
  "Priority Support": "অগ্রাধিকার সহায়তা",
  "Love Stories That Inspire": "অনুপ্রেরণাদায়ী ভালোবাসার গল্প",
  "Real couples who found their perfect match on Marriage Media. Their stories could be your story.": "Marriage Media-তে নিজেদের উপযুক্ত জীবনসঙ্গী খুঁজে পাওয়া বাস্তব দম্পতিদের গল্প। তাদের গল্প আপনার গল্পও হতে পারে।",
  "Moments That Matter": "গুরুত্বপূর্ণ মুহূর্তগুলো",
  "A glimpse at the couples and memories made through Marriage Media.": "Marriage Media-এর মাধ্যমে তৈরি হওয়া দম্পতি ও স্মৃতিগুলোর এক ঝলক।",
  "What Our Premium Members Say": "আমাদের প্রিমিয়াম সদস্যরা কী বলেন",
  "Frequently Asked Questions": "সাধারণ জিজ্ঞাসা",
  "Premium subscriber": "প্রিমিয়াম গ্রাহক",
  "Basic Info": "মৌলিক তথ্য",
  "Photos": "ছবি",
  "Back to Dashboard": "ড্যাশবোর্ডে ফিরে যান",
  "Manage your profile information and preferences.": "আপনার প্রোফাইলের তথ্য ও পছন্দ পরিচালনা করুন।",
  "Free Plan": "ফ্রি প্ল্যান",
  "Upgrade to Premium": "প্রিমিয়ামে আপগ্রেড করুন",
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
  "Select date of birth": "জন্ম তারিখ নির্বাচন করুন",
  "Country": "দেশ",
  "Division": "বিভাগ",
  "District": "জেলা",
  "Present Address": "বর্তমান ঠিকানা",
  "Permanent Address": "স্থায়ী ঠিকানা",
  "Area": "এলাকা",
  "Thana": "থানা",
  "Union": "ইউনিয়ন",
  "Institute Name": "প্রতিষ্ঠানের নাম",
  "Year": "বছর",
  "Your habits": "আপনার অভ্যাস",
  "Exercise": "ব্যায়াম",
  "Reading": "বই পড়া",
  "Travel": "ভ্রমণ",
  "Cooking": "রান্না",
  "Smoking": "ধূমপান",
  "Drinking": "মদ্যপান",
  "Please complete all location fields.": "ঠিকানার সব তথ্য পূরণ করুন।",
  "Complete at least one education field.": "অন্তত একটি শিক্ষার তথ্য সম্পূর্ণ করুন।",
  "Select at least one habit.": "অন্তত একটি অভ্যাস নির্বাচন করুন।",
  "Please answer Yes or No for every habit.": "প্রতিটি অভ্যাসের জন্য হ্যাঁ অথবা না নির্বাচন করুন।",
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
  "How many brothers?": "কতজন ভাই আছে?",
  "How many sisters?": "কতজন বোন আছে?",
  "Profession / Occupation": "পেশা / কর্মসংস্থান",
  "Example: Student, Business, Service": "উদাহরণ: শিক্ষার্থী, ব্যবসা, চাকরি",
  "Present location: select Division, District, Thana and Union below.": "বর্তমান ঠিকানার জন্য নিচের বিভাগ, জেলা, থানা ও ইউনিয়ন নির্বাচন করুন।",
  "Declarations": "ঘোষণা",
  "Yes": "হ্যাঁ",
  "No": "না",
  "My family knows that I am submitting this biodata.": "আপনার পরিবার এই বায়োডাটার বিষয়ে জানে কি?",
  "I confirm before Allah that all information is accurate.": "আল্লাহকে সাক্ষী রেখে আমি সব তথ্য সঠিক দিয়েছি।",
  "I declare before Allah that all information is accurate.": "আল্লাহকে সাক্ষী রেখে বলুন আপনার সব তথ্য সঠিক।",
  "I accept legal and religious responsibility for false information.": "আমি মিথ্যা তথ্য দিলে দুনিয়াবি আইনগত শাস্তি ও আখিরাতের দায় আমার।",
  "Does your family know that you are submitting this biodata on the website?": "আপনি যে ওয়েবসাইটে বায়োডাটা জমা দিচ্ছেন তা আপনার পরিবার জানে কি?",
  "I accept responsibility for legal and religious consequences of false information.": "আমি মিথ্যা তথ্য দিলে দুনিয়াবি আইনগত শাস্তি ও আখিরাতের দায় আমার।",
  "First Name": "নামের প্রথম অংশ",
  "Last Name": "নামের শেষ অংশ",
  "Email (Optional)": "ইমেইল (ঐচ্ছিক)",
  "Mobile Number": "মোবাইল নম্বর",
  "WhatsApp/Imo Number": "হোয়াটসঅ্যাপ/ইমো নম্বর",
  "WhatsApp/Imo number must be exactly 11 digits.": "হোয়াটসঅ্যাপ/ইমো নম্বর অবশ্যই ১১ সংখ্যার হতে হবে।",
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
  "Online": "অনলাইন",
  "Remove from favorites": "পছন্দের তালিকা থেকে সরান",
  "Add to favorites": "পছন্দের তালিকায় যোগ করুন",
  "Delete image": "ছবি মুছুন",
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
  "Number of Children": "ছেলে/মেয়ে কয়জন",
  "Please enter the number of children.": "ছেলে/মেয়ের সংখ্যা লিখুন।",
  "Profile Created By": "প্রোফাইল তৈরি করেছেন",
  "Religion": "ধর্ম",
  "Caste": "জাতি/কাস্ট",
  "Sub-caste": "উপ-জাতি",
  "Mother Tongue": "মাতৃভাষা",
  "Languages": "ভাষা",
  "Nationality": "জাতীয়তা",
  "Blood Group": "রক্তের গ্রুপ",
  "Select blood group": "রক্তের গ্রুপ নির্বাচন করুন",
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
  "Create Your Account": "আপনার অ্যাকাউন্ট তৈরি করুন",
  "Join thousands finding their perfect match": "হাজারো মানুষের সঙ্গে আপনার উপযুক্ত জীবনসঙ্গী খুঁজুন",
  "Create a strong password": "একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন",
  "Confirm your password": "আপনার পাসওয়ার্ড নিশ্চিত করুন",
  "Create Account": "অ্যাকাউন্ট তৈরি করুন",
  "Already have an account?": "ইতিমধ্যে অ্যাকাউন্ট আছে?",
  "100% free to register": "নিবন্ধন সম্পূর্ণ বিনামূল্যে",
  "AI-powered matching": "এআই-চালিত ম্যাচিং",
  "Verified profiles only": "শুধু যাচাইকৃত প্রোফাইল",
  "Mobile verification code": "মোবাইল যাচাইকরণ কোড",
  "A verification code was sent to your mobile number.": "আপনার মোবাইল নম্বরে একটি যাচাইকরণ কোড পাঠানো হয়েছে।",
  "Verify and continue": "যাচাই করে এগিয়ে যান",
  "Enter your mobile number to receive a secure recovery code.": "নিরাপদ পুনরুদ্ধার কোড পেতে আপনার মোবাইল নম্বর লিখুন।",
  "Mobile number": "মোবাইল নম্বর",
  "Confirm password": "পাসওয়ার্ড নিশ্চিত করুন",
  "Reset password": "পাসওয়ার্ড পুনঃসেট করুন",
  "Send recovery code": "পুনরুদ্ধার কোড পাঠান",
  "Use a different number or resend code": "অন্য নম্বর ব্যবহার করুন বা কোড আবার পাঠান",
  "Back to login": "লগইনে ফিরে যান",
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
  "Higher Education": "উচ্চশিক্ষা",
  "Profession": "পেশা",
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
  "Lifestyle Details": "জীবনযাপনের তথ্য",
  "Preference": "পছন্দ",
  "Highest Education": "সর্বোচ্চ শিক্ষা",
  "SSC": "এসএসসি",
  "HSC": "এইচএসসি",
  "Graduation": "স্নাতক",
  "Education Details": "শিক্ষার বিস্তারিত তথ্য",
  "Registered mobile number": "নিবন্ধিত মোবাইল নম্বর",
  "Example: 50,000-100,000": "উদাহরণ: ৫০,০০০-১,০০,০০০",
  "Example: Dhaka, Cox's Bazar": "উদাহরণ: ঢাকা, কক্সবাজার",
  "Institution": "প্রতিষ্ঠান",
  "Annual Income": "বার্ষিক আয়",
  "Present Location": "বর্তমান ঠিকানা",
  "Get In": "যোগাযোগ করুন",
  "Touch": "আমাদের সঙ্গে",
  "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.": "আপনার কোনো প্রশ্ন আছে? আমরা আপনার কথা শুনতে চাই। আমাদের বার্তা পাঠান, আমরা যত দ্রুত সম্ভব উত্তর দেব।",
  "Send a Message": "বার্তা পাঠান",
  "Message Sent!": "বার্তা পাঠানো হয়েছে!",
  "Thank you for reaching out. We'll get back to you within 24 hours.": "যোগাযোগ করার জন্য ধন্যবাদ। আমরা ২৪ ঘণ্টার মধ্যে আপনার সঙ্গে যোগাযোগ করব।",
  "Send Another": "আরেকটি বার্তা পাঠান",
  "Subject": "বিষয়",
  "Message": "বার্তা",
  "Your name": "আপনার নাম",
  "How can we help?": "আমরা কীভাবে সাহায্য করতে পারি?",
  "Tell us more...": "আরও বিস্তারিত জানান...",
  "Sending...": "পাঠানো হচ্ছে...",
  "Send Message": "বার্তা পাঠান",
  "Email Us": "ইমেইল করুন",
  "Call Us": "ফোন করুন",
  "Visit Us": "ঠিকানায় আসুন",
  "Working Hours": "কাজের সময়",
  "We reply within 24 hours": "আমরা ২৪ ঘণ্টার মধ্যে উত্তর দিই",
  "Sat-Thu, 9AM-6PM": "শনি-বৃহস্পতি, সকাল ৯টা-বিকেল ৬টা",
  "By appointment only": "শুধু পূর্বনির্ধারিত সময় অনুযায়ী",
  "Sat - Thu": "শনি - বৃহস্পতি",
  "9:00 AM - 6:00 PM (BST)": "সকাল ৯টা - সন্ধ্যা ৬টা (বাংলাদেশ সময়)",
  "Tips, stories, and insights to help you on your journey.": "আপনার যাত্রায় সহায়ক পরামর্শ, গল্প ও তথ্য।",
  "Search articles...": "প্রবন্ধ খুঁজুন...",
  "All": "সব",
  "Tips & Advice": "পরামর্শ ও নির্দেশনা",
  "Technology": "প্রযুক্তি",
  "Culture": "সংস্কৃতি",
  "Safety": "নিরাপত্তা",
  "Loading articles from the database...": "ডেটাবেস থেকে প্রবন্ধ লোড হচ্ছে...",
  "No articles match your current filters.": "আপনার বর্তমান ফিল্টারের সঙ্গে কোনো প্রবন্ধ মেলেনি।",
  "Recently published": "সম্প্রতি প্রকাশিত",
  "Read more": "আরও পড়ুন",
  "Our Values": "আমাদের মূল্যবোধ",
  "What We Stand For": "আমরা যে নীতিতে বিশ্বাস করি",
  "Our core values guide everything we do, from building features to serving our community.": "ফিচার তৈরি করা থেকে কমিউনিটিকে সেবা দেওয়া পর্যন্ত আমাদের সব কাজকে মূল মূল্যবোধগুলো পরিচালনা করে।",
  "Our Team": "আমাদের দল",
  "Meet the People Behind Marriage Media": "Marriage Media-র নেপথ্যের মানুষদের সঙ্গে পরিচিত হন",
  "A passionate team dedicated to helping you find your perfect match.": "আপনার উপযুক্ত জীবনসঙ্গী খুঁজে দিতে নিবেদিত একটি আন্তরিক দল।",
  "Why Choose Us": "কেন আমাদের বেছে নেবেন",
  "What Makes Us Different": "যা আমাদের আলাদা করে",
  "Most Popular": "সবচেয়ে জনপ্রিয়",
  "Start Premium": "প্রিমিয়াম শুরু করুন",
  "Features": "ফিচার",
  "Dhaka, Bangladesh": "ঢাকা, বাংলাদেশ",
  "Building Dreams of Happy Marriages": "সুখী দাম্পত্যের স্বপ্ন গড়ে তোলা",
  "Marriage Media was founded with a simple mission: to help people find their perfect life partner through technology, trust, and genuine care.": "প্রযুক্তি, বিশ্বাস ও আন্তরিক যত্নের মাধ্যমে মানুষকে উপযুক্ত জীবনসঙ্গী খুঁজে পেতে সাহায্য করার সহজ লক্ষ্য নিয়ে Marriage Media প্রতিষ্ঠিত হয়েছে।",
  "Our Mission": "আমাদের লক্ষ্য",
  "To revolutionize the matchmaking experience in Bangladesh by combining traditional values with modern technology. We strive to create a safe, trusted platform where individuals and families can find compatible life partners with confidence and ease.": "প্রচলিত মূল্যবোধের সঙ্গে আধুনিক প্রযুক্তির সমন্বয়ে বাংলাদেশের জীবনসঙ্গী খোঁজার অভিজ্ঞতায় পরিবর্তন আনা আমাদের লক্ষ্য। আমরা এমন একটি নিরাপদ ও বিশ্বস্ত প্ল্যাটফর্ম তৈরি করতে চাই, যেখানে ব্যক্তি ও পরিবার আত্মবিশ্বাসের সঙ্গে উপযুক্ত জীবনসঙ্গী খুঁজে পাবেন।",
  "Our Vision": "আমাদের ভাবনা",
  "To become Bangladesh's most trusted and loved matrimony platform, known for our commitment to genuine profiles, privacy, and helping millions of people find their happily ever after. We envision a world where every person finds their perfect match.": "সত্যিকারের প্রোফাইল, গোপনীয়তা এবং লাখো মানুষকে সুখী দাম্পত্য খুঁজে পেতে সাহায্য করার জন্য বাংলাদেশের সবচেয়ে বিশ্বস্ত ও প্রিয় বিবাহ প্ল্যাটফর্ম হওয়া আমাদের ভাবনা।",
  "Active Users": "সক্রিয় ব্যবহারকারী",
  "Premium Profiles": "প্রিমিয়াম প্রোফাইল",
  "Verified Profiles": "যাচাইকৃত প্রোফাইল",
  "Happy Families": "সুখী পরিবার",
  "Trusted by Thousands": "হাজারো মানুষের আস্থা",
  "Happy Marriages": "সুখী দাম্পত্য",
  "Loading success stories from the database...": "ডেটাবেস থেকে সফলতার গল্প লোড হচ্ছে...",
  "Recovery code": "পুনরুদ্ধার কোড",
  "New password": "নতুন পাসওয়ার্ড",
  "Visitor Analytics": "ভিজিটর বিশ্লেষণ",
  "Track who views your profile": "কে আপনার প্রোফাইল দেখছে তা দেখুন",
  "No viewer data yet. Complete your profile to attract more visitors!": "এখনও কোনো দর্শকের তথ্য নেই। আরও দর্শক পেতে আপনার প্রোফাইল সম্পূর্ণ করুন!",
  "Profiles you've saved for later.": "পরে দেখার জন্য সংরক্ষিত প্রোফাইল।",
  "No favorites yet": "এখনও কোনো পছন্দের প্রোফাইল নেই",
  "Browse profiles and save your favorites to view them here.": "প্রোফাইল দেখুন এবং এখানে দেখতে পছন্দের তালিকায় সংরক্ষণ করুন।",
  "Interests": "আগ্রহ",
  "Manage your received, sent, and accepted interests.": "আপনার পাওয়া, পাঠানো ও গৃহীত আগ্রহ পরিচালনা করুন।",
  "View Profile": "প্রোফাইল দেখুন",
  "Withdraw": "প্রত্যাহার করুন",
  "Private conversations with instant delivery and live updates.": "দ্রুত বার্তা ও সরাসরি আপডেটসহ ব্যক্তিগত কথোপকথন।",
  "Conversations": "কথোপকথন",
  "Search conversations...": "কথোপকথন খুঁজুন...",
  "No conversations yet": "এখনও কোনো কথোপকথন নেই",
  "No messages in this conversation yet.": "এই কথোপকথনে এখনও কোনো বার্তা নেই।",
  "Select a conversation to start chatting.": "চ্যাট শুরু করতে একটি কথোপকথন নির্বাচন করুন।",
  "Type a message...": "একটি বার্তা লিখুন...",
  "Notifications": "নোটিফিকেশন",
  "Unread": "অপঠিত",
  "Views": "দেখা হয়েছে",
  "You’re all caught up": "সব আপডেট দেখা হয়ে গেছে",
  "New activity will appear here when something needs your attention.": "আপনার মনোযোগ প্রয়োজন এমন নতুন কার্যকলাপ এখানে দেখা যাবে।",
  "Notification Preferences": "নোটিফিকেশন পছন্দ",
  "New interests": "নতুন আগ্রহ",
  "New messages": "নতুন বার্তা",
  "Profile views": "প্রোফাইল দেখা",
  "Payments": "পেমেন্ট",
  "Security alerts": "নিরাপত্তা সতর্কতা",
  "Promotions": "প্রমোশন",
  "Newsletters": "নিউজলেটার",
  "Payment confirmations": "পেমেন্ট নিশ্চিতকরণ",
  "Verification updates": "যাচাইকরণ আপডেট",
  "Enable Quiet Hours": "নির্দিষ্ট সময়ে নোটিফিকেশন বন্ধ রাখুন",
  "Welcome back,": "আবারও স্বাগতম,",
  "Location": "অবস্থান",
  "Min age": "সর্বনিম্ন বয়স",
  "Max age": "সর্বোচ্চ বয়স",
  "Profile Verification": "প্রোফাইল যাচাইকরণ",
  "Verification Progress": "যাচাইকরণের অগ্রগতি",
  "Timeline": "সময়সূচি",
  "Your Profile": "আপনার প্রোফাইল",
  "Your profile workspace": "আপনার প্রোফাইলের কাজের জায়গা",
  "Enter your NID number": "আপনার জাতীয় পরিচয়পত্র নম্বর লিখুন",
  "Enter your passport number": "আপনার পাসপোর্ট নম্বর লিখুন",
  "Complete your payment": "আপনার পেমেন্ট সম্পন্ন করুন",
  "Review your selected plan and payment details.": "নির্বাচিত প্ল্যান ও পেমেন্টের তথ্য যাচাই করুন।",
  "Loading selected plan…": "নির্বাচিত প্ল্যান লোড হচ্ছে…",
  "Please select a plan before continuing.": "এগিয়ে যাওয়ার আগে একটি প্ল্যান নির্বাচন করুন।",
  "View pricing plans": "মূল্য পরিকল্পনা দেখুন",
  "Selected plan": "নির্বাচিত প্ল্যান",
  "Send payment to": "এখানে পেমেন্ট পাঠান",
  "Payment submitted successfully. Our team will verify it shortly.": "পেমেন্ট সফলভাবে জমা হয়েছে। আমাদের দল শিগগিরই এটি যাচাই করবে।",
  "Back to pricing": "মূল্য তালিকায় ফিরে যান",
  "Something went wrong": "কিছু ভুল হয়েছে",
  "Try again": "আবার চেষ্টা করুন",
  "No timeline events yet": "এখনও কোনো সময়সূচির তথ্য নেই",
  "Sender mobile number": "প্রেরকের মোবাইল নম্বর",
  "Transaction ID": "লেনদেনের আইডি",
  "Enter the transaction ID from your payment": "আপনার পেমেন্টের লেনদেনের আইডি লিখুন",
  "Price": "মূল্য",
  "Search messages": "বার্তা খুঁজুন",
  "Voice calls are coming soon": "ভয়েস কল শিগগিরই আসছে",
  "Video calls are coming soon": "ভিডিও কল শিগগিরই আসছে",
  "More options": "আরও বিকল্প",
  "Back to conversations": "কথোপকথনে ফিরে যান",
  "Enter text to check for spam...": "স্প্যাম যাচাই করতে লেখা দিন...",
  "Enter content to moderate...": "পর্যালোচনার জন্য কনটেন্ট দিন...",
  "Fullscreen success story image": "সফলতার গল্পের পূর্ণ পর্দার ছবি",
  "Close fullscreen image": "পূর্ণ পর্দার ছবি বন্ধ করুন",
  "Previous members": "আগের সদস্যরা",
  "Next members": "পরের সদস্যরা",
  "Community statistics": "কমিউনিটির পরিসংখ্যান",
  "Payment method": "পেমেন্টের পদ্ধতি",
  "Submitting…": "জমা দেওয়া হচ্ছে…",
  "Submit payment for verification": "যাচাইয়ের জন্য পেমেন্ট জমা দিন",
  "Your payment details are kept secure.": "আপনার পেমেন্টের তথ্য নিরাপদে সংরক্ষিত থাকে।",
  "Filter by education": "শিক্ষা দিয়ে ফিল্টার করুন",
  "Bachelor's Degree": "স্নাতক ডিগ্রি",
  "Master's Degree": "স্নাতকোত্তর ডিগ্রি",
  "PhD": "পিএইচডি",
  "Filter by location": "অবস্থান দিয়ে ফিল্টার করুন",
  "Minimum age": "সর্বনিম্ন বয়স",
  "Maximum age": "সর্বোচ্চ বয়স",
  "18-25": "১৮-২৫ বছর",
  "26-30": "২৬-৩০ বছর",
  "31-35": "৩১-৩৫ বছর",
  "36-40": "৩৬-৪০ বছর",
  "41-50": "৪১-৫০ বছর",
  "51+": "৫১+ বছর",
  "4'10\"-5'0\"": "৪ ফুট ১০ ইঞ্চি - ৫ ফুট",
  "5'1\"-5'3\"": "৫ ফুট ১ ইঞ্চি - ৫ ফুট ৩ ইঞ্চি",
  "5'4\"-5'6\"": "৫ ফুট ৪ ইঞ্চি - ৫ ফুট ৬ ইঞ্চি",
  "5'7\"-5'9\"": "৫ ফুট ৭ ইঞ্চি - ৫ ফুট ৯ ইঞ্চি",
  "5'10\"-6'0\"": "৫ ফুট ১০ ইঞ্চি - ৬ ফুট",
  "6'1\"-6'3\"": "৬ ফুট ১ ইঞ্চি - ৬ ফুট ৩ ইঞ্চি",
  "বাড়ি/গ্রাম/রোডসহ স্থায়ী ঠিকানা": "Permanent address including house/village/road",
  "বাড়ি/গ্রাম/রোডসহ বর্তমান ঠিকানা": "Present address including house/village/road",
};

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children, forcedLanguage }: { children: React.ReactNode; forcedLanguage?: Language }) {
  // Keep the first client render identical to the server render. Reading
  // localStorage during state initialization caused the header language to
  // differ while React was hydrating.
  const [language, setLanguageState] = React.useState<Language>(forcedLanguage || "bn");
  const [hasHydrated, setHasHydrated] = React.useState(false);

  React.useEffect(() => {
    if (forcedLanguage) {
      queueMicrotask(() => setHasHydrated(true));
      return;
    }
    const saved = localStorage.getItem("marriage-media-language");
    queueMicrotask(() => {
      if (saved === "en") setLanguageState("en");
      setHasHydrated(true);
    });
  }, [forcedLanguage]);

  React.useEffect(() => {
    if (!hasHydrated) return;
    if (forcedLanguage) return;
    localStorage.setItem("marriage-media-language", language);
    document.documentElement.lang = language;
  }, [forcedLanguage, hasHydrated, language]);

  React.useEffect(() => {
    if (!hasHydrated || typeof document === "undefined") return;
    const reverseTranslations = new Map(Object.entries(biodataText).map(([english, bengali]) => [bengali, english]));
    const translate = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return value;
      const translated = language === "bn" ? biodataText[trimmed] : reverseTranslations.get(trimmed);
      if (!translated) return value;
      return value.replace(trimmed, translated);
    };
    const update = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
      textNodes.forEach((node) => {
        if (node.parentElement?.closest("script,style")) return;
        const next = translate(node.nodeValue || "");
        if (next !== node.nodeValue) node.nodeValue = next;
      });
      if (root instanceof Element) {
        root.querySelectorAll("input,textarea,[aria-label],[title]").forEach((element) => {
          ["placeholder", "aria-label", "title"].forEach((attribute) => {
            const value = element.getAttribute(attribute);
            if (value) element.setAttribute(attribute, translate(value));
          });
        });
      }
    };
    update(document.body);
    const observer = new MutationObserver((mutations) => mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => update(node))));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [hasHydrated, language]);

  React.useEffect(() => {
    let active = true;
    void fetch("/api/locations?level=labels", { cache: "force-cache" })
      .then((response) => response.ok ? response.json() as Promise<{ labels?: Record<string, string> }> : null)
      .then((result) => {
        if (active && result?.labels) registerLocationLabels(result.labels);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

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
