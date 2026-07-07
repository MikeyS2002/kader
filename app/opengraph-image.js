import { ImageResponse } from "next/og";

import { studios } from "@/lib/studios";

/* Standaard social share-beeld: wordmark + tagline op cyc. */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Kader — elke studio in beeld";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#EDEDEA",
          color: "#171716",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <svg width="130" height="130" viewBox="0 0 120 120" fill="none">
            <path
              d="M14 22 C14 15 19 10 26 10 H94 C101 10 106 15 106 22 V70 C106 96 86 110 60 110 C34 110 14 96 14 70 Z"
              stroke="#171716"
              strokeWidth="9"
              fill="none"
            />
            <circle cx="60" cy="63" r="11" fill="#00B140" />
          </svg>
          <div
            style={{
              fontSize: 190,
              fontWeight: 800,
              letterSpacing: "-0.05em",
              lineHeight: 0.9,
            }}
          >
            kader
          </div>
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 34,
            opacity: 0.65,
            letterSpacing: "0.02em",
          }}
        >
          {`elke studio in beeld — ${studios.length} studio's op één kaart`}
        </div>
      </div>
    ),
    size
  );
}
