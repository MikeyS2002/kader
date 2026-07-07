import { ImageResponse } from "next/og";

import { eur, getStudioBySlug, specsList, studios, TYPE_NOUNS } from "@/lib/studios";

/* Per-studio share-beeld: typografisch, in merkstijl. */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return studios.map((s) => ({ slug: s.slug }));
}

export async function generateImageMetadata({ params }) {
  const { slug } = await params;
  const studio = getStudioBySlug(slug);
  return [{ id: "og", size, contentType, alt: studio?.name ?? "Kader" }];
}

export default async function OgImage({ params }) {
  const { slug } = await params;
  const studio = getStudioBySlug(slug);
  if (!studio) return new ImageResponse(<div style={{ display: "flex" }} />, size);

  const specs = specsList(studio.specs).slice(0, 4).join("  ·  ");
  const price = studio.prices.hourEUR
    ? `${eur(studio.prices.hourEUR)} / uur`
    : studio.prices.firstDayEUR
      ? `${eur(studio.prices.firstDayEUR)} / dag`
      : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#EDEDEA",
          color: "#171716",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: "0.1em",
              opacity: 0.6,
            }}
          >
            {`${(TYPE_NOUNS[studio.type] ?? "STUDIO").toUpperCase()} · ${(studio.city ?? "").toUpperCase()}`}
          </div>
          <svg width="84" height="84" viewBox="0 0 120 120" fill="none">
            <path
              d="M14 22 C14 15 19 10 26 10 H94 C101 10 106 15 106 22 V70 C106 96 86 110 60 110 C34 110 14 96 14 70 Z"
              stroke="#171716"
              strokeWidth="9"
              fill="none"
            />
            <circle cx="60" cy="63" r="11" fill="#00B140" />
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: studio.name.length > 60 ? 52 : 64,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            maxWidth: 1000,
          }}
        >
          {studio.name}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontSize: 28,
          }}
        >
          <div style={{ display: "flex", opacity: 0.65 }}>{specs}</div>
          {price ? (
            <div style={{ display: "flex", fontWeight: 700, color: "#00B140" }}>
              {price}
            </div>
          ) : null}
        </div>
      </div>
    ),
    size
  );
}
