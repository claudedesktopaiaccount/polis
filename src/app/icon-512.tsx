import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon512() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "#111110",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#F4F3EE",
            fontSize: 300,
            fontFamily: "serif",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-12px",
          }}
        >
          Π
        </span>
      </div>
    ),
    { ...size }
  );
}
