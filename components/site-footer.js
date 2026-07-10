import Link from "next/link";

import { KaderMark } from "@/components/kader-mark";
import { Typography } from "@/components/typography";
import { landingsForType, TYPE_NOUNS, TYPE_URL_PREFIX } from "@/lib/studios";

/* Footer voor contentpagina's (landingspagina's, studio-detail, 404):
 * interne links naar de grootste steden per type — goed voor bezoekers
 * én voor de interne linkstructuur. */

const TYPES = ["foto", "podcast", "muziek"];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid w-full max-w-[1080px] gap-10 px-6 py-14 sm:grid-cols-3 sm:px-10">
        {TYPES.map((type) => (
          <nav key={type} aria-label={`${TYPE_NOUNS[type]} huren per stad`}>
            <Link
              href={`/${TYPE_URL_PREFIX[type]}`}
              className="type-label !text-[12px] !text-flag opacity-50 hover:opacity-100"
            >
              {`${TYPE_NOUNS[type]} huren`}
            </Link>
            <ul className="mt-4 space-y-2">
              {landingsForType(type)
                .slice(0, 6)
                .map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/${p.slug}`}
                      className="text-[14px] !text-flag opacity-80 hover:opacity-100"
                    >
                      {`${p.city} (${p.studios.length})`}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center gap-x-6 gap-y-3 border-t border-line px-6 py-8 sm:px-10">
        <span className="flex items-center gap-2">
          <KaderMark className="h-5 w-5" />
          <span className="font-display text-base font-extrabold tracking-[-0.04em] lowercase">
            kader
          </span>
        </span>
        <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.08em] !text-flag opacity-55 hover:opacity-100">
          kaart
        </Link>
        <Typography type="caption" className="ml-auto opacity-40">
          elke studio in beeld · aanbod via gearbooker.com en rechtstreeks bij
          studio&apos;s
        </Typography>
      </div>
    </footer>
  );
}
