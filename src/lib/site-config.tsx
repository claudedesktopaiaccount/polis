import { ImageResponse } from "next/og";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://progresivne.sk";
export const SITE_NAME = "Polis";
export const SITE_DESCRIPTION =
  "Agregátor prieskumov, predikcie volieb, koaličný simulátor a tipovanie pre slovenské parlamentné voľby.";
export const SITE_LOCALE = "sk_SK";

/** Brand colors used in generated icons and OG images. */
export const BRAND_COLORS = {
  ink: "#111110",
  paper: "#F4F3EE",
  divider: "#D6D5CF",
} as const;

/** Render the "P" brand icon at the given dimensions. Used by icon.tsx and apple-icon.tsx. */
export function renderBrandIcon(
  size: { width: number; height: number },
  borderRadius: number,
  fontSize: number,
) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BRAND_COLORS.ink,
          borderRadius,
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight: 700,
            color: BRAND_COLORS.paper,
            fontFamily: "serif",
            lineHeight: 1,
          }}
        >
          P
        </span>
      </div>
    ),
    { ...size },
  );
}
