"use client";

import { PublicProfileContent } from "./profile-content";

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  return <PublicProfileContent params={params} />;
}
