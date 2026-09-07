import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/seo-constants";

export const alt = `${SITE_CONFIG.name} - Find Your Perfect Life Partner`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/jpeg";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#fff8f6",
          color: "#0f172a",
          padding: 72,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: 24,
              background: "#e11d48",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            M
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 42, fontWeight: 800 }}>{SITE_CONFIG.name}</div>
            <div style={{ fontSize: 24, color: "#be123c" }}>Verified matrimony for Bangladesh</div>
          </div>
        </div>
        <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.04, maxWidth: 920 }}>
          Find your perfect life partner with AI-powered matchmaking.
        </div>
        <div style={{ fontSize: 30, color: "#475569", marginTop: 28, maxWidth: 850 }}>
          Verified profiles, secure communication, and meaningful matches for families.
        </div>
      </div>
    ),
    size
  );
}
