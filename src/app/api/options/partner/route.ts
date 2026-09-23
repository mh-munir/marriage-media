export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import LookupOption from "@/models/LookupOption";

const ANY_OPTION = { value: "", label: "Any", labelBn: "যেকোনো" };

const DEFAULT_PARTNER_OPTIONS = {
  age: [
    ANY_OPTION,
    { value: "18-25", label: "18-25", labelBn: "১৮-২৫" },
    { value: "26-30", label: "26-30", labelBn: "২৬-৩০" },
    { value: "31-35", label: "31-35", labelBn: "৩১-৩৫" },
    { value: "36-40", label: "36-40", labelBn: "৩৬-৪০" },
    { value: "41-50", label: "41-50", labelBn: "৪১-৫০" },
    { value: "51+", label: "51+", labelBn: "৫১+" },
  ],
  height: [
    ANY_OPTION,
    { value: "4'10\"-5'0\"", label: "4'10\"-5'0\"", labelBn: "৪'১০\" - ৫'০\"" },
    { value: "5'1\"-5'3\"", label: "5'1\"-5'3\"", labelBn: "৫'১\" - ৫'৩\"" },
    { value: "5'4\"-5'6\"", label: "5'4\"-5'6\"", labelBn: "৫'৪\" - ৫'৬\"" },
    { value: "5'7\"-5'9\"", label: "5'7\"-5'9\"", labelBn: "৫'৭\" - ৫'৯\"" },
    { value: "5'10\"-6'0\"", label: "5'10\"-6'0\"", labelBn: "৫'১০\" - ৬'০\"" },
    { value: "6'1\"-6'3\"", label: "6'1\"-6'3\"", labelBn: "৬'১\" - ৬'৩\"" },
  ],
  weight: [
    ANY_OPTION,
    { value: "40-50 kg", label: "40-50 kg", labelBn: "৪০-৫০ কেজি" },
    { value: "50-60 kg", label: "50-60 kg", labelBn: "৫০-৬০ কেজি" },
    { value: "60-70 kg", label: "60-70 kg", labelBn: "৬০-৭০ কেজি" },
    { value: "70-80 kg", label: "70-80 kg", labelBn: "৭০-৮০ কেজি" },
    { value: "80-90 kg", label: "80-90 kg", labelBn: "৮০-৯০ কেজি" },
    { value: "90-100 kg", label: "90-100 kg", labelBn: "৯০-১০০ কেজি" },
    { value: "100+ kg", label: "100+ kg", labelBn: "১০০+ কেজি" },
  ],
  maritalStatus: [
    ANY_OPTION,
    { value: "Never Married", label: "Never Married", labelBn: "অবিবাহিত" },
    { value: "Divorced", label: "Divorced", labelBn: "তালাকপ্রাপ্ত" },
    { value: "Widowed", label: "Widowed", labelBn: "বিধবা/বিপত্নীক" },
    { value: "Awaiting Divorce", label: "Awaiting Divorce", labelBn: "তালাকের অপেক্ষায়" },
  ],
  religion: [
    ANY_OPTION,
    { value: "Islam", label: "Islam", labelBn: "ইসলাম" },
    { value: "Hinduism", label: "Hinduism", labelBn: "হিন্দুধর্ম" },
    { value: "Buddhism", label: "Buddhism", labelBn: "বৌদ্ধধর্ম" },
    { value: "Christianity", label: "Christianity", labelBn: "খ্রিস্টধর্ম" },
    { value: "Sikhism", label: "Sikhism", labelBn: "শিখধর্ম" },
    { value: "Other", label: "Other", labelBn: "অন্যান্য" },
  ],
  highestEducation: [
    ANY_OPTION,
    { value: "SSC", label: "SSC", labelBn: "এসএসসি" },
    { value: "HSC", label: "HSC", labelBn: "এইচএসসি" },
    { value: "Graduation", label: "Graduation", labelBn: "স্নাতক" },
    { value: "Post Graduation", label: "Post Graduation", labelBn: "স্নাতকোত্তর" },
    { value: "Professional Degree", label: "Professional Degree", labelBn: "পেশাগত ডিগ্রি" },
  ],
  familyType: [
    ANY_OPTION,
    { value: "Joint", label: "Joint", labelBn: "যৌথ পরিবার" },
    { value: "Nuclear", label: "Nuclear", labelBn: "একক পরিবার" },
  ],
  familyStatus: [
    ANY_OPTION,
    { value: "Middle Class", label: "Middle Class", labelBn: "মধ্যবিত্ত" },
    { value: "Upper Middle Class", label: "Upper Middle Class", labelBn: "উচ্চ মধ্যবিত্ত" },
    { value: "Rich", label: "Rich", labelBn: "সম্পদশালী" },
    { value: "Affluent", label: "Affluent", labelBn: "অত্যন্ত স্বচ্ছল" },
  ],
  familyValues: [
    ANY_OPTION,
    { value: "Orthodox", label: "Orthodox", labelBn: "রক্ষণশীল" },
    { value: "Traditional", label: "Traditional", labelBn: "ঐতিহ্যবাহী" },
    { value: "Moderate", label: "Moderate", labelBn: "মধ্যপন্থী" },
    { value: "Liberal", label: "Liberal", labelBn: "উদারপন্থী" },
    { value: "Secular", label: "Secular", labelBn: "ধর্মনিরপেক্ষ" },
  ],
} as const;

const CATEGORY_KEYS = Object.keys(DEFAULT_PARTNER_OPTIONS) as Array<keyof typeof DEFAULT_PARTNER_OPTIONS>;

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") === "bn" ? "bn" : "en";

    const categories = await LookupOption.find({ category: { $in: CATEGORY_KEYS.map((key) => `partner.${key}`) }, isActive: true })
      .sort({ category: 1, sortOrder: 1, label: 1 })
      .lean();

    const seeded: Record<string, Array<{ value: string; label: string; labelBn: string }>> = {};
    for (const key of CATEGORY_KEYS) {
      const category = `partner.${key}`;
      const existing = categories.filter((option) => option.category === category);
      if (existing.length > 0) {
        seeded[key] = existing.map((item) => ({
          value: String(item.value),
          label: lang === "bn" ? String(item.labelBn || item.label) : String(item.label),
          labelBn: String(item.labelBn || item.label),
        }));
        continue;
      }

      const defaults = DEFAULT_PARTNER_OPTIONS[key];
      await LookupOption.insertMany(
        defaults.map((option, index) => ({
          category,
          value: option.value,
          label: option.label,
          labelBn: option.labelBn,
          sortOrder: index + 1,
          isActive: true,
        })),
      );
      seeded[key] = defaults.map((option) => ({
        value: option.value,
        label: lang === "bn" ? option.labelBn : option.label,
        labelBn: option.labelBn,
      }));
    }

    return NextResponse.json({ options: seeded });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load partner options.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
