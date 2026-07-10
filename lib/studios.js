import data from "@/data/studios.json";

/* Gedeelde toegang tot de gescrapete dataset (scripts/scrape-studios.mjs).
 * Slugs worden bij de bron (scraper) gegenereerd; de kaart gebruikt de
 * slanke variant data/studios.map.json. */

export const studios = data.studios;

export const getStudioBySlug = (slug) =>
  studios.find((s) => s.slug === slug) ?? null;

export const eur = (v) => `€${v % 1 ? v.toFixed(2).replace(".", ",") : v}`;

export const TYPE_LABELS = { foto: "Foto", podcast: "Podcast", muziek: "Muziek" };
/* De foto-categorie is bij de bron "photo & film studios" — mensen zoeken
 * op beide termen, dus de pagina's dragen ze allebei. */
export const TYPE_NOUNS = {
  foto: "Foto- en videostudio",
  podcast: "Podcaststudio",
  muziek: "Muziekstudio",
};
export const BADGE_VARIANTS = { foto: "flag", podcast: "gel", muziek: "papier" };

/* SEO-landingspagina's per (type × stad): /fotostudio-huren-amsterdam enz. */
export const TYPE_URL_PREFIX = {
  foto: "fotostudio-huren",
  podcast: "podcaststudio-huren",
  muziek: "muziekstudio-huren",
};

export const landingPages = (() => {
  const map = new Map();
  for (const s of studios) {
    if (!s.citySlug || !TYPE_URL_PREFIX[s.type]) continue;
    const slug = `${TYPE_URL_PREFIX[s.type]}-${s.citySlug}`;
    if (!map.has(slug)) {
      map.set(slug, {
        slug,
        type: s.type,
        city: s.city,
        citySlug: s.citySlug,
        studios: [],
      });
    }
    map.get(slug).studios.push(s);
  }
  return [...map.values()].sort((a, b) => b.studios.length - a.studios.length);
})();

export const getLandingBySlug = (slug) =>
  landingPages.find((p) => p.slug === slug) ?? null;

export const landingsForCity = (citySlug) =>
  landingPages.filter((p) => p.citySlug === citySlug);

export const landingsForType = (type) =>
  landingPages.filter((p) => p.type === type);

/* Type-overzichtspagina's: /fotostudio-huren enz. — alle steden + studio's
 * van één type. Head-term SEO en de gebruikersingang vanuit het menu. */
export const typeOverviews = Object.entries(TYPE_URL_PREFIX).map(
  ([type, slug]) => ({
    slug,
    type,
    studios: studios.filter((s) => s.type === type),
    cities: landingPages.filter((p) => p.type === type),
  })
);

export const getTypeOverview = (slug) =>
  typeOverviews.find((o) => o.slug === slug) ?? null;

/* "vanaf €X/uur" (of dagdeel/dag) voor een set studio's */
export function fromPrice(list) {
  const hours = list.map((s) => s.prices.hourEUR).filter(Boolean);
  if (hours.length) return `vanaf ${eur(Math.min(...hours))}/uur`;
  const parts = list.map((s) => s.prices.dayPartEUR).filter(Boolean);
  if (parts.length) return `vanaf ${eur(Math.min(...parts))}/dagdeel`;
  const days = list.map((s) => s.prices.firstDayEUR).filter(Boolean);
  if (days.length) return `vanaf ${eur(Math.min(...days))}/dag`;
  return "";
}

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
