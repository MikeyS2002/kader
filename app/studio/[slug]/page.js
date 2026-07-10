import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/badge";
import { PageEvent } from "@/components/page-event";
import { StudioCta } from "@/components/studio-cta";
import {
  BADGE_VARIANTS,
  eur,
  getStudioBySlug,
  specsList,
  studios,
  TYPE_LABELS,
  TYPE_NOUNS,
  TYPE_URL_PREFIX,
} from "@/lib/studios";
import { SITE_URL } from "@/lib/site";
import { Typography } from "@/components/typography";

/* Studio-detailpagina — statisch gegenereerd per studio uit data/studios.json.
 * Boeken gebeurt (voorlopig) extern via Gearbooker. */

export function generateStaticParams() {
  return studios.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const studio = getStudioBySlug(slug);
  if (!studio) return {};
  const specs = specsList(studio.specs).join(" · ");
  const price = studio.prices.hourEUR
    ? ` Vanaf ${eur(studio.prices.hourEUR)}/uur.`
    : studio.prices.firstDayEUR
      ? ` Vanaf ${eur(studio.prices.firstDayEUR)}/dag.`
      : "";
  return {
    title: studio.name,
    description: `${TYPE_NOUNS[studio.type] ?? "Studio"} huren in ${studio.city}.${specs ? ` ${specs}.` : ""}${price}`,
    alternates: { canonical: `/studio/${studio.slug}` },
  };
}

export default async function StudioPage({ params }) {
  const { slug } = await params;
  const studio = getStudioBySlug(slug);
  if (!studio) notFound();

  const priceRows = [
    ["per uur", studio.prices.hourEUR],
    ["2 uur", studio.prices.twoHoursEUR],
    ["dagdeel (4 uur)", studio.prices.dayPartEUR],
    [
      studio.prices.extraDayEUR ? "eerste dag" : "dag",
      studio.prices.firstDayEUR,
    ],
    ["extra dag", studio.prices.extraDayEUR],
    ["per week", studio.prices.weekEUR],
  ].filter(([, v]) => v);
  const isDirect = studio.source === "direct";
  const specs = specsList(studio.specs);
  const cityPage = studio.citySlug
    ? `/${TYPE_URL_PREFIX[studio.type]}-${studio.citySlug}`
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: studio.name,
        image: studio.image || undefined,
        description: studio.description || undefined,
        url: `${SITE_URL}/studio/${studio.slug}`,
        offers: {
          "@type": "Offer",
          price: String(
            studio.prices.hourEUR ??
              studio.prices.twoHoursEUR ??
              studio.prices.dayPartEUR ??
              studio.prices.firstDayEUR ??
              ""
          ),
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: studio.url,
        },
        ...(studio.rating && studio.reviewCount
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: studio.rating,
                reviewCount: studio.reviewCount,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Kader",
            item: `${SITE_URL}/`,
          },
          ...(cityPage
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: `${TYPE_NOUNS[studio.type]} huren in ${studio.city}`,
                  item: `${SITE_URL}${cityPage}`,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: cityPage ? 3 : 2,
            name: studio.name,
          },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-[1080px] px-6 pb-24 pt-24 sm:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageEvent
        event="studio_detail_view"
        params={{
          studio_id: studio.id,
          studio_name: studio.name,
          city: studio.city,
          studio_type: studio.type,
        }}
      />
      <Link
        href={`/?studio=${studio.id}`}
        className="font-mono text-xs uppercase tracking-[0.12em] !text-flag opacity-55 hover:opacity-100"
      >
        ← alle studio&apos;s op de kaart
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
        {/* Beeld + beschrijving */}
        <div>
          <div className="cyc-shape overflow-hidden border border-line bg-papier">
            {studio.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={studio.image}
                alt={studio.name}
                className="h-[280px] w-full object-cover sm:h-[420px]"
              />
            ) : (
              <div className="flex-center h-[280px] sm:h-[420px]">
                <Typography type="caption" className="opacity-50">
                  geen beeld beschikbaar
                </Typography>
              </div>
            )}
          </div>
          {studio.description
            ? studio.description.split(/\n+/).map((paragraph, i) => (
                <p
                  key={i}
                  className={`max-w-[62ch] text-[15px] opacity-80 ${i === 0 ? "mt-6" : "mt-3"}`}
                >
                  {paragraph}
                </p>
              ))
            : null}
        </div>

        {/* Info + prijzen */}
        <div>
          <div className="flex items-center gap-3">
            <Badge variant={BADGE_VARIANTS[studio.type] ?? "flag"}>
              {TYPE_LABELS[studio.type] ?? studio.type}
            </Badge>
            <Typography type="caption" className="opacity-60">
              {studio.city}
            </Typography>
            {studio.rating ? (
              <Typography type="caption" className="opacity-60">
                {`· beoordeling ${String(studio.rating).replace(".", ",")}${studio.reviewCount ? ` (${studio.reviewCount})` : ""}`}
              </Typography>
            ) : null}
          </div>

          <h1 className="type-h2 mt-4">{studio.name}</h1>

          {specs.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {specs.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em]"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : null}

          <div
            data-theme="white"
            className="cyc-shape-s mt-7 border border-line bg-background p-6"
          >
            <Typography type="label" as="div" className="opacity-50">
              Huurprijzen
            </Typography>
            <div className="mt-2">
              {priceRows.length ? (
                priceRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between border-t border-dashed border-line py-2.5 first:border-t-0"
                  >
                    <Typography type="caption" className="opacity-70">
                      {label}
                    </Typography>
                    <Typography type="spec" className="font-medium">
                      {eur(value)}
                    </Typography>
                  </div>
                ))
              ) : (
                <Typography type="caption" as="p" className="py-2.5 opacity-70">
                  prijs op aanvraag — zie de site van de studio
                </Typography>
              )}
            </div>

            <StudioCta
              studio={{
                id: studio.id,
                name: studio.name,
                city: studio.city,
                type: studio.type,
                price:
                  studio.prices.hourEUR ??
                  studio.prices.dayPartEUR ??
                  studio.prices.firstDayEUR ??
                  0,
                url: studio.url,
              }}
              bookLabel={isDirect ? "Boek bij de studio" : "Boek via Gearbooker"}
              mapHref={`/?studio=${studio.id}`}
            />

            <Typography type="caption" as="p" className="mt-4 opacity-40">
              {isDirect
                ? "rechtstreeks bij de studio · prijzen van hun site, kunnen afwijken"
                : "via gearbooker.com · prijzen kunnen daar afwijken"}
            </Typography>
          </div>

          {cityPage ? (
            <p className="mt-6">
              <Link href={cityPage} className="text-[15px] font-medium">
                {`Meer ${TYPE_NOUNS[studio.type].toLowerCase()}'s in ${studio.city} →`}
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
