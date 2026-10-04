"use client";

import { useEffect, useRef } from "react";

export function VisitorTracker() {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    void fetch("/api/analytics/visitor", {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
    }).catch(() => undefined);
  }, []);

  return null;
}