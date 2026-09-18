export type SupportedLanguage = "bn" | "en";

export type LocalizedValue = {
  bn?: string;
  en?: string;
};

export function localizedText(
  value: unknown,
  language: SupportedLanguage,
  fallback = "",
): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return fallback;
  const localized = value as LocalizedValue;
  return localized[language] || localized.en || localized.bn || fallback;
}

export function localizedField(
  record: Record<string, unknown>,
  field: string,
  language: SupportedLanguage,
  fallback = "",
): string {
  const languageValue = record[`${field}${language === "bn" ? "Bn" : "En"}`];
  if (typeof languageValue === "string" && languageValue.trim()) return languageValue;
  return localizedText(record[field], language, fallback);
}
