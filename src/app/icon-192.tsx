import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon192() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: "#111110",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#F4F3EE",
            fontSize: 110,
            fontFamily: "serif",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-4px",
          }}
        >
          Π
        </span>
      </div>
    ),
    { ...size }
  );
}
