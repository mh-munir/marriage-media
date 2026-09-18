const bengaliLocationLabels: Record<string, string> = {
  Bangladesh: "বাংলাদেশ",
  Dhaka: "ঢাকা",
  Chattagram: "চট্টগ্রাম",
  Chittagong: "চট্টগ্রাম",
  "Cox's Bazar": "কক্সবাজার",
  Coxsbazar: "কক্সবাজার",
  "Cox's Bazar Sadar": "কক্সবাজার সদর",
  "Coxsbazar Sadar": "কক্সবাজার সদর",
  Eidgaon: "ঈদগাঁও",
  Islampur: "ইসলামপুর",
  Division: "বিভাগ",
  District: "জেলা",
  Thana: "থানা",
  Union: "ইউনিয়ন",
  Area: "এলাকা",
};

export function registerLocationLabels(labels: Record<string, string>): void {
  Object.assign(bengaliLocationLabels, labels);
}

export function translateLocationLabel(value: string, language: "bn" | "en"): string {
  if (language !== "bn") return value;
  return bengaliLocationLabels[value] || value;
}