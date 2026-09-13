"use client";

import { PublicProfileContent } from "@/app/dashboard/profile/[userId]/profile-content";

export default function PublicBiodataPage({ params }: { params: Promise<{ userId: string }> }) {
  return <PublicProfileContent params={params} />;
}
