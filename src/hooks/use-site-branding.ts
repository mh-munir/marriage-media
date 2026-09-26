"use client";

import * as React from "react";

export type SiteBranding = { headerLogoUrl: string; footerLogoUrl: string };

const emptyBranding: SiteBranding = { headerLogoUrl: "", footerLogoUrl: "" };
let brandingPromise: Promise<SiteBranding> | null = null;
let brandingCache: SiteBranding | null = null;

async function loadBranding(): Promise<SiteBranding> {
  if (brandingCache) return brandingCache;
  if (!brandingPromise) {
    brandingPromise = fetch("/api/site-branding", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return emptyBranding;
        const data = (await response.json()) as Partial<SiteBranding>;
        return {
          headerLogoUrl: data.headerLogoUrl || "",
          footerLogoUrl: data.footerLogoUrl || "",
        };
      })
      .catch(() => emptyBranding)
      .then((value) => {
        brandingCache = value;
        return value;
      });
  }

  return brandingPromise;
}

export function useSiteBranding() {
  const [branding, setBranding] = React.useState<SiteBranding>(brandingCache ?? emptyBranding);

  React.useEffect(() => {
    let active = true;
    void loadBranding().then((value) => {
      if (active) setBranding(value);
    });
    return () => { active = false; };
  }, []);

  return branding;
}
