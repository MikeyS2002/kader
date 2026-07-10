"use client";

import Link from "next/link";

import { Button } from "@/components/button";
import { track } from "@/lib/analytics";

/* De twee knoppen op de studio-detailpagina, met event-tracking.
 * booking_click is hét conversiemoment richting Gearbooker. */

export function StudioCta({ studio, mapHref }) {
  const params = {
    studio_id: studio.id,
    studio_name: studio.name,
    city: studio.city,
    studio_type: studio.type,
    price: studio.price,
  };

  return (
    <div className="mt-5 flex flex-wrap gap-2.5">
      <Button
        variant="primary"
        label="Boek via Gearbooker"
        as="a"
        href={studio.url}
        target="_blank"
        rel="nofollow noopener noreferrer"
        onClick={() => track("booking_click", params)}
      />
      <Button
        variant="ghost"
        label="Toon op kaart"
        as={Link}
        href={mapHref}
        onClick={() => track("show_on_map_click", { studio_id: studio.id })}
      />
    </div>
  );
}
