/* Eén plek voor site-brede constanten — bij een domeinwissel hoeft alleen
 * dit bestand (en de Vercel-domeinconfig) aangepast te worden. */

export const SITE_URL = "https://www.kaderstudios.nl";
export const SITE_NAME = "Kader";

/* GA4 — alleen in productie, zodat localhost-geklik de data niet vervuilt.
 * Env-var kan de ID overschrijven; de ID zelf is publiek. */
export const GA_ID =
  process.env.NODE_ENV === "production"
    ? (process.env.NEXT_PUBLIC_GA_ID ?? "G-V5QDYCXHN8")
    : null;
