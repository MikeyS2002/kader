import Link from "next/link";

import { Badge } from "@/components/badge";
import { Typography } from "@/components/typography";
import { BADGE_VARIANTS, eur, specsList, TYPE_LABELS } from "@/lib/studios";

/* Listing card — het kerncomponent van de brand board: bovenkant strak,
 * onderkant met de cyc-curve, specs in mono. Server-safe. */

export function StudioCard({ studio }) {
  const price = studio.prices.hourEUR
    ? `${eur(studio.prices.hourEUR)}/uur`
    : studio.prices.twoHoursEUR
      ? `${eur(studio.prices.twoHoursEUR)} / 2 uur`
      : studio.prices.dayPartEUR
        ? `${eur(studio.prices.dayPartEUR)}/dagdeel`
        : studio.prices.firstDayEUR
          ? `${eur(studio.prices.firstDayEUR)}/dag`
          : null;
  const specs = specsList(studio.specs).slice(0, 4).join(" · ");

  return (
    <Link
      href={`/studio/${studio.slug}`}
      className="group block no-underline hover:no-underline"
    >
      <article className="cyc-shape-s overflow-hidden border border-line bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] pointer:group-hover:-translate-y-1">
        <div className="relative h-44 bg-papier">
          {studio.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={studio.image}
              alt={studio.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : null}
          <Badge
            variant={BADGE_VARIANTS[studio.type] ?? "flag"}
            className="absolute left-3 top-3"
          >
            {`${TYPE_LABELS[studio.type] ?? studio.type} · ${studio.city}`}
          </Badge>
        </div>
        <div className="p-5">
          <h3 className="font-sans text-[15px] font-semibold leading-snug tracking-normal text-flag">
            {studio.name}
          </h3>
          {specs ? (
            <Typography type="caption" as="p" className="mt-1.5 !text-flag opacity-60">
              {specs}
            </Typography>
          ) : null}
          <div className="mt-3 flex items-baseline justify-between gap-3">
            {price ? (
              <Typography type="spec" className="text-[13px] font-medium !text-flag">
                {price}
              </Typography>
            ) : (
              <span />
            )}
            <span className="text-[13px] font-semibold text-chroma">
              Bekijk →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
