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
  Kotwali: "কোতোয়ালী",
  "Double Mooring": "ডবলমুরিং",
  Panchlaish: "পাঁচলাইশ",
  Khulshi: "খুলশী",
  Halishahar: "হালিশহর",
  Chandgaon: "চান্দগাঁও",
  Bakalia: "বাকলিয়া",
  "Bayezid Bostami": "বায়েজিদ বোস্তামী",
  "Akbar Shah": "আকবর শাহ",
  Patenga: "পতেঙ্গা",
  "Chittagong Port": "চট্টগ্রাম বন্দর",
  "Chattogram Port": "চট্টগ্রাম বন্দর",
  Jorargonj: "জোরারগঞ্জ",
  EPZ: "ইপিজেড",
  Division: "বিভাগ",
  District: "জেলা",
  Thana: "থানা",
  Union: "ইউনিয়ন",
  Area: "এলাকা",
};

export type LocationLabelNode = {
  name?: string;
  bnName?: string;
  districts?: LocationLabelNode[];
  upazilas?: LocationLabelNode[];
  areas?: LocationLabelNode[];
  unions?: LocationLabelNode[];
};

export function registerLocationLabels(labels: Record<string, string>): void {
  Object.entries(labels).forEach(([key, value]) => {
    bengaliLocationLabels[key] = value;
    bengaliLocationLabels[normalizedLabelKey(key)] = value;
  });
}

export function collectBengaliLocationLabels(
  nodes: LocationLabelNode[],
  sourceLabels: ReadonlyMap<string, string>,
): Record<string, string> {
  const labels: Record<string, string> = {};

  const visit = (items: LocationLabelNode[] | undefined) => {
    for (const node of items || []) {
      const name = node.name?.trim();
      if (name) labels[name] = resolveBengaliLocationLabel(name, sourceLabels, node.bnName);
      visit(node.districts);
      visit(node.upazilas);
      visit(node.areas);
      visit(node.unions);
    }
  };

  visit(nodes);
  return labels;
}

export function resolveBengaliLocationLabel(
  value: string,
  sourceLabels: ReadonlyMap<string, string>,
  datasetLabel?: string,
): string {
  if (datasetLabel?.trim()) return datasetLabel.trim();
  const sourceLabel = sourceLabels.get(normalizedLabelKey(value));
  if (sourceLabel) return sourceLabel;
  return translateLocationLabel(value, "bn");
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
        || bengaliLocationLabels[normalizedLabelKey(part)]
        || part)
      .join(", ");
  }

  return bengaliLocationLabels[trimmed]
    || bengaliLocationLabels[normalizedLabelKey(trimmed)]
    || trimmed;
}

function normalizedLabelKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
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