import { ImageResponse } from "next/og";
import { BRAND_COLORS } from "@/lib/site-config";

export const alt = "Polis — Slovenské prieskumy a predikcie";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BRAND_COLORS.ink,
          padding: 60,
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: "#7c3aed",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: BRAND_COLORS.paper,
              fontFamily: "serif",
              letterSpacing: "-0.02em",
            }}
          >
            Polis
          </span>

          {/* Divider */}
          <div
            style={{
              width: 120,
              height: 2,
              backgroundColor: BRAND_COLORS.divider,
              opacity: 0.4,
            }}
          />

          <span
            style={{
              fontSize: 28,
              color: BRAND_COLORS.paper,
              opacity: 0.7,
              fontFamily: "sans-serif",
              textAlign: "center",
            }}
          >
            Slovenské prieskumy a predikcie
          </span>
        </div>

        {/* Bottom tagline */}
        <span
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: BRAND_COLORS.paper,
            opacity: 0.35,
            fontFamily: "sans-serif",
          }}
        >
          prieskumy · predikcie · koalície · tipovanie
        </span>
      </div>
    ),
    { ...size },
  );
}
