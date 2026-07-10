import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/button";
import { PageEvent } from "@/components/page-event";
import { SiteFooter } from "@/components/site-footer";
import { StudioCard } from "@/components/studio-card";
import { Eyebrow, Typography } from "@/components/typography";
import {
  fromPrice,
  getLandingBySlug,
  getTypeOverview,
  landingPages,
  landingsForCity,
  landingsForType,
  TYPE_NOUNS,
  typeOverviews,
} from "@/lib/studios";
import { SITE_URL } from "@/lib/site";

/* SEO-landingspagina's: /fotostudio-huren-amsterdam enz. — één pagina per
 * (type × stad) met alle studio's als listing cards en interne links naar
 * de andere types in de stad en dezelfde zoekterm in andere steden. */

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...typeOverviews.map((o) => ({ slug: o.slug })),
    ...landingPages.map((p) => ({ slug: p.slug })),
  ];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const overview = getTypeOverview(slug);
  if (overview) {
    const noun = TYPE_NOUNS[overview.type];
    const price = fromPrice(overview.studios);
    return {
      title: `${noun} huren — ${overview.studios.length} studio's`,
      description: `${noun} huren in ${overview.cities.length} steden in Nederland en België${price ? `, ${price}` : ""}. Vergelijk m², daglicht, limbowand en parkeren — specs en prijzen op één kaart.`,
      alternates: { canonical: `/${overview.slug}` },
    };
  }
  const page = getLandingBySlug(slug);
  if (!page) return {};
  const noun = TYPE_NOUNS[page.type];
  const n = page.studios.length;
  const price = fromPrice(page.studios);
  return {
    title: `${noun} huren in ${page.city}`,
    description: `${n} ${noun.toLowerCase()}${n === 1 ? "" : "'s"} te huur in ${page.city}${price ? `, ${price}` : ""}. Vergelijk m², daglicht, limbowand en parkeren — specs en prijzen op één kaart.`,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function LandingPage({ params }) {
  const { slug } = await params;
  const overview = getTypeOverview(slug);
  if (overview) return <TypeOverviewPage overview={overview} />;
  const page = getLandingBySlug(slug);
  if (!page) notFound();

  const noun = TYPE_NOUNS[page.type];
  const n = page.studios.length;
  const price = fromPrice(page.studios);
  const otherTypesHere = landingsForCity(page.citySlug).filter(
    (p) => p.slug !== page.slug
  );
  const otherCities = landingsForType(page.type)
    .filter((p) => p.slug !== page.slug)
    .slice(0, 18);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Kader",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: `${noun} huren in ${page.city}`,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: `${noun} huren in ${page.city}`,
        numberOfItems: n,
        itemListElement: page.studios.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/studio/${s.slug}`,
          name: s.name,
        })),
      },
    ],
  };

  return (
    <>
    <main className="mx-auto w-full max-w-[1080px] px-6 pb-24 pt-24 sm:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageEvent
        event="city_page_view"
        params={{ city: page.city, studio_type: page.type, count: n }}
      />

      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.12em] !text-flag opacity-55 hover:opacity-100"
      >
        ← alle studio&apos;s op de kaart
      </Link>

      <Eyebrow className="mt-10">
        {`${n} ${n === 1 ? "studio" : "studio's"} · ${page.city}`}
      </Eyebrow>
      <h1 className="mt-3">{`${noun} huren in ${page.city}`}</h1>
      <Typography type="body-l" as="p" className="mt-4 max-w-[52ch]">
        {n === 1
          ? `Eén ${noun.toLowerCase()} te huur in ${page.city}${price ? `, ${price}` : ""}.`
          : `${n} ${noun.toLowerCase()}'s te huur in ${page.city}${price ? `, ${price}` : ""}.`}{" "}
        Vergelijk op wat telt — m², daglicht, limbowand, parkeren — en boek
        direct.
      </Typography>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {page.studios.map((s) => (
          <StudioCard key={s.id} studio={s} />
        ))}
      </div>

      <div className="mt-8">
        <Button variant="ghost" label="Bekijk op de kaart" as={Link} href="/" />
      </div>

      {otherTypesHere.length ? (
        <section className="mt-16 border-t border-line pt-10">
          <Typography type="label" as="h2" className="!text-[12px] opacity-50">
            {`Ook in ${page.city}`}
          </Typography>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {otherTypesHere.map((p) => (
              <Link key={p.slug} href={`/${p.slug}`} className="text-[15px] font-medium">
                {`${TYPE_NOUNS[p.type]} huren in ${p.city} (${p.studios.length})`}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {otherCities.length ? (
        <section className="mt-10 border-t border-line pt-10">
          <Typography type="label" as="h2" className="!text-[12px] opacity-50">
            {`${noun} huren in andere steden`}
          </Typography>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {otherCities.map((p) => (
              <Link key={p.slug} href={`/${p.slug}`} className="text-[15px] font-medium">
                {`${p.city} (${p.studios.length})`}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <Typography type="caption" as="p" className="mt-14 opacity-40">
        aanbod via gearbooker.com en rechtstreeks bij studio&apos;s
      </Typography>
    </main>
      <SiteFooter />
    </>
  );
}

/* Type-overzicht: alle steden en alle studio's van één type. */
function TypeOverviewPage({ overview }) {
  const noun = TYPE_NOUNS[overview.type];
  const n = overview.studios.length;
  const price = fromPrice(overview.studios);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Kader",
            item: `${SITE_URL}/`,
          },
          { "@type": "ListItem", position: 2, name: `${noun} huren` },
        ],
      },
      {
        "@type": "ItemList",
        name: `${noun} huren`,
        numberOfItems: n,
        itemListElement: overview.cities.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/${p.slug}`,
          name: `${noun} huren in ${p.city}`,
        })),
      },
    ],
  };

  return (
    <>
    <main className="mx-auto w-full max-w-[1080px] px-6 pb-24 pt-24 sm:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageEvent
        event="city_page_view"
        params={{ city: "alle", studio_type: overview.type, count: n }}
      />

      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.12em] !text-flag opacity-55 hover:opacity-100"
      >
        ← alle studio&apos;s op de kaart
      </Link>

      <Eyebrow className="mt-10">
        {`${n} studio's · ${overview.cities.length} steden`}
      </Eyebrow>
      <h1 className="mt-3">{`${noun} huren`}</h1>
      <Typography type="body-l" as="p" className="mt-4 max-w-[52ch]">
        {`${n} ${noun.toLowerCase()}'s te huur in Nederland en België${price ? `, ${price}` : ""}.`}{" "}
        Vergelijk op wat telt — m², daglicht, limbowand, parkeren — en boek
        direct.
      </Typography>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
        {overview.cities.map((p) => (
          <Link key={p.slug} href={`/${p.slug}`} className="text-[15px] font-medium">
            {`${p.city} (${p.studios.length})`}
          </Link>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {overview.studios.map((s) => (
          <StudioCard key={s.id} studio={s} />
        ))}
      </div>

      <div className="mt-8">
        <Button variant="ghost" label="Bekijk op de kaart" as={Link} href="/" />
      </div>

      <Typography type="caption" as="p" className="mt-14 opacity-40">
        aanbod via gearbooker.com en rechtstreeks bij studio&apos;s
      </Typography>
    </main>
      <SiteFooter />
    </>
  );
}
