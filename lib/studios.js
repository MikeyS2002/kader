import data from "@/data/studios.json";

/* Gedeelde toegang tot de gescrapete dataset (scripts/scrape-studios.mjs):
 * voegt een stabiele, leesbare slug toe per studio. */

const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");

export const studios = data.studios.map((s) => ({
  ...s,
  slug: `${slugify(s.name)}-${s.id}`,
}));

export const getStudioBySlug = (slug) =>
  studios.find((s) => s.slug === slug) ?? null;

export const eur = (v) => `€${v % 1 ? v.toFixed(2).replace(".", ",") : v}`;

export const TYPE_LABELS = { foto: "Foto", podcast: "Podcast", muziek: "Muziek" };

/* Specs als leesbare lijst, voor chips en metadata. */
export function specsList(specs) {
  const parts = [];
  if (specs.areaM2) parts.push(`${specs.areaM2} m²`);
  if (specs.ceilingM)
    parts.push(`plafond ${String(specs.ceilingM).replace(".", ",")} m`);
  if (specs.cyclorama) parts.push("limbowand");
  if (specs.greenscreen) parts.push("greenscreen");
  if (specs.daylight) parts.push("daglicht");
  if (specs.parking) parts.push("parkeren");
  if (specs.blackout) parts.push("verduisterbaar");
  if (specs.powerHeavy) parts.push("krachtstroom");
  return parts;
}
