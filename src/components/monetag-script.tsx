"use client";

import Script from "next/script";

export function MonetagScript({ src }: { src?: string }) {
  if (!src) return null;

  return (
    <Script
      id="monetag-script"
      src={src}
      strategy="afterInteractive"
      data-cfasync="false"
      async
    />
  );
}
