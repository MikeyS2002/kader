import { ImageResponse } from "next/og";

/* Apple touch icon — beeldmerk op cyc, zonder eigen afronding
 * (iOS rondt zelf af). */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#EDEDEA",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <path
            d="M14 22 C14 15 19 10 26 10 H94 C101 10 106 15 106 22 V70 C106 96 86 110 60 110 C34 110 14 96 14 70 Z"
            stroke="#171716"
            strokeWidth="9"
            fill="none"
          />
          <circle cx="60" cy="63" r="11" fill="#00B140" />
        </svg>
      </div>
    ),
    size
  );
}
