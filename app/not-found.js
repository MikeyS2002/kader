import Link from "next/link";

import { Button } from "@/components/button";
import { KaderMark } from "@/components/kader-mark";
import { SiteFooter } from "@/components/site-footer";
import { Eyebrow, Typography } from "@/components/typography";
import { landingPages } from "@/lib/studios";

export const metadata = {
  title: "Niet gevonden",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const popular = landingPages.slice(0, 5);

  return (
    <>
      <main className="mx-auto flex w-full max-w-[1080px] flex-col items-start px-6 pb-10 pt-28 sm:px-10">
        <KaderMark className="h-14 w-14" />
        <Eyebrow className="mt-8">404</Eyebrow>
        <h1 className="mt-3">Niet in beeld</h1>
        <Typography type="body-l" as="p" className="mt-4 max-w-[48ch]">
          Deze pagina bestaat niet (meer). De studio&apos;s staan gewoon op de
          kaart — of begin bij een populaire zoekopdracht.
        </Typography>

        <div className="mt-8">
          <Button variant="primary" label="Naar de kaart" as={Link} href="/" />
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
          {popular.map((p) => (
            <Link key={p.slug} href={`/${p.slug}`} className="text-[15px] font-medium">
              {`${p.city} (${p.studios.length})`}
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
