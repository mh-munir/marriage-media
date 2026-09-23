export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import LookupOption from "@/models/LookupOption";

const DEFAULT_PROFESSIONS = [
  { value: "Student", label: "Student", labelBn: "শিক্ষার্থী" },
  { value: "Teacher", label: "Teacher", labelBn: "শিক্ষক" },
  { value: "Doctor", label: "Doctor", labelBn: "চিকিৎসক" },
  { value: "Engineer", label: "Engineer", labelBn: "প্রকৌশলী" },
  { value: "Government Service", label: "Government Service", labelBn: "সরকারি চাকরি" },
  { value: "Private Service", label: "Private Service", labelBn: "বেসরকারি চাকরি" },
  { value: "Business Owner", label: "Business Owner", labelBn: "ব্যবসায়ী" },
  { value: "Farmer", label: "Farmer", labelBn: "কৃষক" },
  { value: "Bank Officer", label: "Bank Officer", labelBn: "ব্যাংক কর্মকর্তা" },
  { value: "Lawyer", label: "Lawyer", labelBn: "আইনজীবী" },
  { value: "Accountant", label: "Accountant", labelBn: "হিসাবরক্ষক" },
  { value: "IT Professional", label: "IT Professional", labelBn: "আইটি পেশাজীবী" },
  { value: "Freelancer", label: "Freelancer", labelBn: "ফ্রিল্যান্সার" },
  { value: "Nurse", label: "Nurse", labelBn: "নার্স" },
  { value: "Architect", label: "Architect", labelBn: "স্থপতি" },
  { value: "Civil Servant", label: "Civil Servant", labelBn: "সিভিল সার্ভেন্ট" },
  { value: "Entrepreneur", label: "Entrepreneur", labelBn: "উদ্যোক্তা" },
  { value: "Homemaker", label: "Homemaker", labelBn: "গৃহিণী" },
  { value: "Retired", label: "Retired", labelBn: "অবসরপ্রাপ্ত" },
  { value: "Other", label: "Other", labelBn: "অন্যান্য" },
] as const;

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") === "bn" ? "bn" : "en";

    const existing = await LookupOption.find({ category: "profession", isActive: true })
      .sort({ sortOrder: 1, label: 1 })
      .lean();

    if (!existing.length) {
      await LookupOption.insertMany(
        DEFAULT_PROFESSIONS.map((profession, index) => ({
          category: "profession",
          value: profession.value,
          label: profession.label,
          labelBn: profession.labelBn,
          sortOrder: index + 1,
          isActive: true,
        })),
      );
    }

    const options = (await LookupOption.find({ category: "profession", isActive: true })
      .sort({ sortOrder: 1, label: 1 })
      .lean())
      .map((item) => ({
        value: item.value,
        label: lang === "bn" ? item.labelBn || item.label : item.label,
      }));

    return NextResponse.json({ options });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load profession options.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
