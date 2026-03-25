import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Prieskumy | Polis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function PrieskumyOGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#F4F3EE",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 100px",
          borderLeft: "8px solid #111110",
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontFamily: "serif",
            color: "#111110",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 24,
            opacity: 0.5,
          }}
        >
          Polis
        </div>
        <div
          style={{
            fontSize: 80,
            fontFamily: "serif",
            fontWeight: 700,
            color: "#111110",
            lineHeight: 1.1,
            marginBottom: 32,
          }}
        >
          Prieskumy
        </div>
        <div
          style={{
            fontSize: 28,
            fontFamily: "sans-serif",
            color: "#444",
            maxWidth: 800,
          }}
        >
          Aktuálne volebné prieskumy a trendy pre slovenské parlamentné voľby
        </div>
      </div>
    ),
    { ...size }
  );
}
