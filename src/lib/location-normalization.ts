export function normalizeDistrictName(value: string | undefined | null): string {
  const trimmedValue = value?.trim() || "";
  const compactValue = trimmedValue.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (compactValue === "coxsbazar") return "Cox's Bazar";
  if (compactValue === "coxsbazarsadar") return "Cox's Bazar Sadar";
  return trimmedValue;
}

export function normalizeProfileDistricts<T extends {
  district?: string;
  permanentLocation?: { district?: string };
  partnerPreferences?: { district?: string };
}>(profile: T): T {
  return {
    ...profile,
    district: normalizeDistrictName(profile.district),
    permanentLocation: profile.permanentLocation
      ? { ...profile.permanentLocation, district: normalizeDistrictName(profile.permanentLocation.district) }
      : profile.permanentLocation,
    partnerPreferences: profile.partnerPreferences
      ? { ...profile.partnerPreferences, district: normalizeDistrictName(profile.partnerPreferences.district) }
      : profile.partnerPreferences,
  };
}