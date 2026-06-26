/**
 * Parse User-Agent string to extract device information.
 */

interface DeviceInfo {
  deviceType: "desktop" | "mobile" | "tablet";
  deviceBrand: string;
  os: string;
  browser: string;
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();

  // Device type detection
  let deviceType: "desktop" | "mobile" | "tablet" = "desktop";
  if (/mobile|android|iphone|ipod/i.test(ua)) {
    deviceType = "mobile";
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = "tablet";
  }

  // OS detection
  let os = "Unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os/i.test(ua)) os = "macOS";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/cros/i.test(ua)) os = "Chrome OS";

  // Browser detection
  let browser = "Unknown";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/chrome/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  // Brand detection
  let deviceBrand = "Unknown";
  if (/samsung/i.test(ua)) deviceBrand = "Samsung";
  else if (/iphone|ipad|ipod/i.test(ua)) deviceBrand = "Apple";
  else if (/huawei/i.test(ua)) deviceBrand = "Huawei";
  else if (/xiaomi|mi /i.test(ua)) deviceBrand = "Xiaomi";
  else if (/oneplus/i.test(ua)) deviceBrand = "OnePlus";
  else if (/oppo/i.test(ua)) deviceBrand = "OPPO";
  else if (/vivo/i.test(ua)) deviceBrand = "Vivo";
  else if (/realme/i.test(ua)) deviceBrand = "Realme";
  else if (/motorola|moto/i.test(ua)) deviceBrand = "Motorola";
  else if (/lg/i.test(ua)) deviceBrand = "LG";
  else if (/sony|xperia/i.test(ua)) deviceBrand = "Sony";
  else if (/pixel/i.test(ua)) deviceBrand = "Google";

  return { deviceType, deviceBrand, os, browser };
}

/**
 * Generate a simple device fingerprint from request headers.
 */
export function generateDeviceFingerprint(
  ipAddress: string,
  userAgent: string,
  acceptLanguage?: string | null
): string {
  const data = `${ipAddress}:${userAgent}:${acceptLanguage || ""}`;
  // Simple hash - in production use a proper fingerprinting library
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `fp_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
}