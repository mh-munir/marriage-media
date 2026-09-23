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
  Object.entries(labels).forEach(([key, value]) => {
    bengaliLocationLabels[key] = value;
    bengaliLocationLabels[key.toLowerCase().replace(/[^a-z0-9]/g, "")] = value;
  });
}

export function translateLocationLabel(value: string, language: "bn" | "en"): string {
  if (language !== "bn") return value;

  const trimmed = value.trim();
  if (!trimmed) return value;

  const parts = trimmed
    .split(/,|\||\//)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length > 1) {
    return parts
      .map((part) => bengaliLocationLabels[part]
        || bengaliLocationLabels[part.toLowerCase().replace(/[^a-z0-9]/g, "")]
        || part)
      .join(", ");
  }

  return bengaliLocationLabels[trimmed]
    || bengaliLocationLabels[trimmed.toLowerCase().replace(/[^a-z0-9]/g, "")]
    || trimmed;
}

export function formatLocationValue(
  value: string | number | null | undefined,
  language: "bn" | "en",
  fallbackTranslate?: (text: string) => string,
): string {
  if (value === null || value === undefined) return "";

  const text = String(value).trim();
  if (!text) return "";

  if (language !== "bn") return text;

  const translated = translateLocationLabel(text, language);
  if (translated !== text) return translated;

  return fallbackTranslate ? fallbackTranslate(text) : text;
}