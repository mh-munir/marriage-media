"use client";

import * as React from "react";

export type SiteBranding = { headerLogoUrl: string; footerLogoUrl: string };

const emptyBranding: SiteBranding = { headerLogoUrl: "", footerLogoUrl: "" };

export function useSiteBranding() {
  const [branding, setBranding] = React.useState<SiteBranding>(emptyBranding);

  React.useEffect(() => {
    let active = true;
    void fetch("/api/site-branding", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : emptyBranding)
      .then((data: Partial<SiteBranding>) => {
        if (active) setBranding({ headerLogoUrl: data.headerLogoUrl || "", footerLogoUrl: data.footerLogoUrl || "" });
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return branding;
}
