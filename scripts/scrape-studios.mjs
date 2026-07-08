#!/usr/bin/env node
/* Kader studio-scraper
 *
 * Verzamelt huurbare studio's (foto/film, podcast, muziek) van Gearbooker
 * via hun sitemaps (toegestaan in robots.txt) en schrijft een genormaliseerde
 * dataset naar data/studios.json.
 *
 * - Beleefd: lage concurrency, delay tussen batches, duidelijke User-Agent.
 * - Specs worden uit de beschrijving geparst (m², plafond, daglicht,
 *   limbowand/cyclorama, greenscreen, parkeren, krachtstroom).
 * - Steden worden gegeocodeerd via een ingebouwde NL-tabel, met Nominatim
 *   (1 req/s) als fallback; resultaten gecachet in data/geocode-cache.json.
 *
 * Gebruik: node scripts/scrape-studios.mjs
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const UA =
  "kader-studio-scraper/0.1 (prototype; contact: mikeschaper12@gmail.com)";
const OUT_DIR = path.join(process.cwd(), "data");
const OUT_FILE = path.join(OUT_DIR, "studios.json");
const CACHE_FILE = path.join(OUT_DIR, "geocode-cache.json");

const SITEMAPS = [
  {
    url: "https://www.gearbooker.com/sitemap-listings-en/46/photo-studios-and-film-studios.xml",
    type: "foto",
  },
  {
    url: "https://www.gearbooker.com/sitemap-listings-en/168/podcast-studios.xml",
    type: "podcast",
  },
  {
    url: "https://www.gearbooker.com/sitemap-listings-en/126/music-studios-and-sound-studios.xml",
    type: "muziek",
  },
];

const BATCH_SIZE = 4;
const BATCH_DELAY_MS = 600;

/* Veelvoorkomende plaatsen — scheelt honderden Nominatim-calls. [lng, lat] */
const NL_PLACES = {
  amsterdam: [4.8952, 52.3702],
  rotterdam: [4.4777, 51.9244],
  "den-haag": [4.3007, 52.0705],
  "the-hague": [4.3007, 52.0705],
  utrecht: [5.1214, 52.0907],
  eindhoven: [5.4697, 51.4416],
  groningen: [6.5665, 53.2194],
  tilburg: [5.0913, 51.5606],
  almere: [5.2647, 52.3508],
  breda: [4.7683, 51.5719],
  nijmegen: [5.8626, 51.8126],
  arnhem: [5.8987, 51.9851],
  haarlem: [4.6462, 52.3874],
  amersfoort: [5.3878, 52.1561],
  zaandam: [4.8262, 52.4389],
  zwolle: [6.083, 52.5168],
  leiden: [4.497, 52.1601],
  maastricht: [5.691, 50.8514],
  dordrecht: [4.6901, 51.8133],
  ede: [5.6697, 52.0468],
  alphen: [4.6572, 52.1263],
  leeuwarden: [5.7999, 53.2012],
  alkmaar: [4.7534, 52.6324],
  delft: [4.357, 52.0116],
  venlo: [6.1724, 51.3704],
  deventer: [6.1552, 52.2661],
  amstelveen: [4.8639, 52.3114],
  hilversum: [5.1766, 52.2242],
  hengelo: [6.7931, 52.2653],
  purmerend: [4.9592, 52.505],
  schiedam: [4.3888, 51.9192],
  lelystad: [5.4714, 52.5185],
  gouda: [4.7105, 52.0115],
  vlaardingen: [4.3419, 51.9121],
  almelo: [6.6642, 52.3566],
  zoetermeer: [4.4931, 52.0575],
  emmen: [6.9062, 52.7792],
  vijfhuizen: [4.678, 52.3508],
  "den-helder": [4.7592, 52.9563],
  "den-bosch": [5.3037, 51.6978],
  "s-hertogenbosch": [5.3037, 51.6978],
  apeldoorn: [5.9699, 52.2112],
  enschede: [6.8937, 52.2215],
  haarlemmermeer: [4.6913, 52.3007],
  hoofddorp: [4.6913, 52.3007],
  diemen: [4.9615, 52.3396],
  weesp: [5.0431, 52.3081],
  bussum: [5.1615, 52.2734],
  veenendaal: [5.5544, 52.0286],
  roermond: [5.9871, 51.1913],
  heerlen: [5.9805, 50.8882],
  sittard: [5.8697, 51.0017],
  oss: [5.5181, 51.765],
  uden: [5.6197, 51.6608],
  helmond: [5.6611, 51.4793],
  waalwijk: [5.0669, 51.6826],
  roosendaal: [4.4653, 51.5306],
  middelburg: [3.6109, 51.4988],
  goes: [3.8887, 51.5047],
  assen: [6.5626, 52.9967],
  hoorn: [5.0597, 52.6425],
  ijsselstein: [5.0431, 52.0201],
  nieuwegein: [5.0806, 52.0292],
  houten: [5.1682, 52.0286],
  zeist: [5.2331, 52.0906],
  barneveld: [5.585, 52.1399],
  harderwijk: [5.6206, 52.3413],
  drachten: [6.0989, 53.1122],
  sneek: [5.6578, 53.0329],
  heerenveen: [5.9195, 52.9602],
  hoogeveen: [6.4759, 52.7221],
  doetinchem: [6.2887, 51.9654],
  zutphen: [6.196, 52.1428],
  tiel: [5.4297, 51.8858],
  culemborg: [5.2261, 51.9554],
  wijchen: [5.7256, 51.8093],
  best: [5.39, 51.5073],
  veldhoven: [5.4027, 51.4187],
  oisterwijk: [5.1919, 51.5793],
  etten: [4.6357, 51.5695],
  "etten-leur": [4.6357, 51.5695],
  barendrecht: [4.5342, 51.8564],
  capelle: [4.5777, 51.9298],
  ridderkerk: [4.6021, 51.872],
  spijkenisse: [4.3296, 51.845],
  rijswijk: [4.3253, 52.0365],
  voorburg: [4.3592, 52.0726],
  wassenaar: [4.4019, 52.1397],
  katwijk: [4.3997, 52.2032],
  noordwijk: [4.4444, 52.2411],
  beverwijk: [4.6566, 52.4874],
  heemskerk: [4.6716, 52.5112],
  castricum: [4.6589, 52.5486],
  hoofdorp: [4.6913, 52.3007],
  aalsmeer: [4.7492, 52.2635],
  uithoorn: [4.8249, 52.2367],
  mijdrecht: [4.8608, 52.2065],
  woerden: [4.8836, 52.0852],
  bodegraven: [4.7469, 52.0821],
  soest: [5.2916, 52.1735],
  baarn: [5.2874, 52.2112],
  huizen: [5.2411, 52.2995],
  blaricum: [5.2446, 52.2727],
  laren: [5.2278, 52.2569],
  naarden: [5.1626, 52.2955],
  muiden: [5.0714, 52.3299],
  landsmeer: [4.9154, 52.4306],
  oostzaan: [4.8735, 52.4384],
  wormerveer: [4.7847, 52.4906],
  krommenie: [4.7642, 52.4952],
  assendelft: [4.7532, 52.4871],
  volendam: [5.0699, 52.4948],
  edam: [5.0489, 52.5125],
  monnickendam: [5.0378, 52.4574],
};

/* Kader is een NL/BE-platform: buitenlandse metropolen expliciet overslaan
 * (anders geocodeert "Paris" op een gehucht in Gelderland). */
const FOREIGN_CITIES = new Set([
  "london",
  "edgware",
  "brighton",
  "paris",
  "bobigny",
  "lyon",
  "berlin",
  "koln",
  "kamen",
  "leipzig",
  "mannheim",
  "munchen",
  "regensburg",
  "wien",
  "wiesbaden",
  "kbenhavn",
  "grenaa",
  "herning",
]);

/* NL + BE bounding box — laatste vangnet na het geocoderen. */
const inBenelux = ([lng, lat]) =>
  lng > 2.5 && lng < 7.3 && lat > 49.4 && lat < 53.7;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function decodeEntities(s) {
  return (s ?? "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function parseJsonLd(html) {
  const blocks = [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    ),
  ];
  for (const [, raw] of blocks) {
    try {
      const data = JSON.parse(sanitizeJson(raw));
      if (data["@type"] === "Product") return data;
    } catch {
      /* volgende blok proberen */
    }
  }
  return null;
}

/* Letterlijke control-chars in strings maken JSON.parse kapot. Newlines
 * escapen we (alinea's blijven behouden), de rest wordt een spatie.
 * Buiten strings blijft whitespace ongemoeid - daar is het geldige JSON. */
function sanitizeJson(raw) {
  let out = "";
  let inString = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (inString) {
      if (c === "\\") {
        out += c + (raw[++i] ?? "");
        continue;
      }
      if (c === '"') {
        inString = false;
        out += c;
        continue;
      }
      if (c.charCodeAt(0) < 0x20) {
        out += c === "\n" ? "\\n" : " ";
        continue;
      }
      out += c;
    } else {
      if (c === '"') inString = true;
      out += c;
    }
  }
  return out;
}

/* Specs uit naam + beschrijving halen (Nederlandse teksten). */
function parseSpecs(text) {
  const t = text.toLowerCase();

  let areaM2 = null;
  for (const m of t.matchAll(/(\d{2,4})\s?(?:m2|m²|m\s?&#178;|vierkante meter)/g)) {
    const v = Number(m[1]);
    if (v >= 10 && v <= 5000) areaM2 = Math.max(areaM2 ?? 0, v);
  }

  let ceilingM = null;
  const ceil = t.match(
    /(?:plafond|hoogte|hoog|nok)\D{0,12}(\d{1,2}(?:[.,]\d)?)\s?(?:m\b|meter)/
  );
  if (ceil) {
    const v = Number(ceil[1].replace(",", "."));
    if (v >= 2 && v <= 30) ceilingM = v;
  }

  return {
    areaM2,
    ceilingM,
    daylight: /daglicht|natuurlijk licht|natural light|raampartij/.test(t),
    cyclorama: /limbo|cyclorama|rondwand|coving|infinity wall|witte hoek/.test(t),
    greenscreen: /green\s?screen|chroma\s?key|greenkey|green key/.test(t),
    parking: /parkeer|parking|parkeren/.test(t),
    powerHeavy: /krachtstroom|400v|380v|63a|32a/.test(t),
    blackout: /verduister|black[- ]?out|volledig donker/.test(t),
  };
}

/* "1.150,00" (EU-notatie) → 1150 */
function eurToNumber(s) {
  const v = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(v) && v > 0 ? v : null;
}

/* Prijzen uit het prijsblok van de pagina — NIET uit de JSON-LD: dat veld
 * is de uurprijs zonder eenheid en werd eerder onterecht als dagprijs
 * gelezen. Gearbooker toont: "€ X per hour", "€ Y for the first (rental)
 * day", "€ Z per extra day", "€ W per week". Gerelateerde kaartjes op de
 * pagina gebruiken andere frasen ("/day", "Extra day:"), dus deze patronen
 * matchen alleen het hoofdblok. */
function parsePrices(html) {
  const grab = (re) => {
    const m = html.match(re);
    return m ? eurToNumber(m[1]) : null;
  };
  return {
    hourEUR: grab(/€\s*([\d.,]+)\s*(?:per hour|\/ ?hour|per uur|\/ ?uur)/i),
    firstDayEUR: grab(/€\s*([\d.,]+)\s*for the first (?:rental )?day/i),
    extraDayEUR: grab(/€\s*([\d.,]+)\s*per extra day/i),
    weekEUR: grab(/€\s*([\d.,]+)\s*per week/i),
  };
}

function cityFromSlug(url) {
  // greedy prefix zodat we de LAATSTE '-in-' pakken (titels bevatten soms 'in')
  const m = url.match(/^.*-in-([a-z0-9-]+?)-\d+-l$/);
  if (!m) return null;
  const slug = m[1];
  const name = slug
    .split("-")
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ")
    .replace(/\b(den|de|het|van|aan|op|ter)\b/gi, (w) => w.toLowerCase())
    .replace(/^./, (c) => c.toUpperCase());
  return { slug, name };
}

/* Deterministische jitter (~±350 m) zodat studio's in dezelfde stad niet
 * exact op elkaar liggen. Gebaseerd op de listing-id, dus stabiel. */
function jitter(id, [lng, lat]) {
  let h = 2166136261;
  for (const c of id) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const a = ((h >>> 0) % 1000) / 1000 - 0.5;
  const b = (((h >>> 10) >>> 0) % 1000) / 1000 - 0.5;
  return [lng + a * 0.009, lat + b * 0.006];
}

async function geocode(cityName, citySlug, cache) {
  const key = citySlug.toLowerCase();
  if (NL_PLACES[key]) return NL_PLACES[key];
  if (cache[key]) return cache[key];

  // Nominatim: max 1 req/s, duidelijke UA (usage policy)
  await sleep(1100);
  const q = encodeURIComponent(cityName);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&countrycodes=nl,be&format=json&limit=1`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    const data = await res.json();
    if (data[0]) {
      const coords = [Number(data[0].lon), Number(data[0].lat)];
      cache[key] = coords;
      return coords;
    }
  } catch {
    /* geen resultaat */
  }
  cache[key] = null;
  return null;
}

async function scrapeListing(url, type) {
  const html = await fetchText(url);
  const ld = parseJsonLd(html);
  if (!ld) return null;

  const name = decodeEntities(ld.name).replace(/\s+/g, " ").trim();
  // volledige beschrijving, met alinea's intact — voor detailpagina's/SEO
  const description = decodeEntities(ld.description ?? "")
    .replace(/^Rent and try gear before you buy\.\s*/i, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const city = cityFromSlug(url);
  const id = url.match(/-(\d+)-l$/)?.[1] ?? url;

  return {
    id: `gb-${id}`,
    slug: `${slugifyName(name)}-gb-${id}`,
    name,
    type,
    city: city?.name ?? null,
    citySlug: city?.slug ?? null,
    url,
    image: ld.image ?? null,
    prices: parsePrices(html),
    rating: ld.aggregateRating?.ratingValue
      ? Number(ld.aggregateRating.ratingValue)
      : null,
    reviewCount: ld.aggregateRating?.reviewCount
      ? Number(ld.aggregateRating.reviewCount)
      : null,
    specs: parseSpecs(`${name} ${description}`),
    description,
    source: "gearbooker",
  };
}

/* Zelfde slug-logica als voorheen in lib/studios.js — nu bij de bron. */
function slugifyName(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let cache = {};
  try {
    cache = JSON.parse(await readFile(CACHE_FILE, "utf8"));
  } catch {
    /* nog geen cache */
  }

  // 1. Listing-URL's verzamelen uit de sitemaps
  const targets = [];
  for (const { url, type } of SITEMAPS) {
    const xml = await fetchText(url);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const loc of locs) targets.push({ url: loc, type });
    console.log(`sitemap ${type}: ${locs.length} listings`);
    await sleep(400);
  }

  // 2. Listings scrapen in kleine batches
  const studios = [];
  const failed = [];
  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(({ url, type }) => scrapeListing(url, type))
    );
    results.forEach((r, j) => {
      if (r.status === "fulfilled" && r.value) studios.push(r.value);
      else failed.push(batch[j].url);
    });
    process.stdout.write(
      `\rgescraped: ${Math.min(i + BATCH_SIZE, targets.length)}/${targets.length}`
    );
    await sleep(BATCH_DELAY_MS);
  }
  console.log();

  // 3. Eén retry voor mislukte pagina's
  for (const url of [...failed]) {
    try {
      const type = targets.find((t) => t.url === url)?.type ?? "foto";
      const studio = await scrapeListing(url, type);
      if (studio) {
        studios.push(studio);
        failed.splice(failed.indexOf(url), 1);
      }
      await sleep(500);
    } catch {
      /* blijft mislukt */
    }
  }

  // 4. Geocoderen per stad + jitter per studio
  const withCoords = [];
  for (const studio of studios) {
    if (!studio.citySlug) continue;
    // stad-slugs kunnen samengesteld zijn ("centrum-gent"): check laatste woord ook
    const lastWord = studio.citySlug.split("-").pop();
    if (FOREIGN_CITIES.has(studio.citySlug) || FOREIGN_CITIES.has(lastWord)) {
      continue;
    }
    const base = await geocode(studio.city, studio.citySlug, cache);
    if (!base) {
      console.warn(`geen coördinaten voor: ${studio.city}`);
      continue;
    }
    if (!inBenelux(base)) {
      console.warn(`buiten NL/BE, overgeslagen: ${studio.city}`);
      continue;
    }
    const [lng, lat] = jitter(studio.id, base);
    withCoords.push({ ...studio, lng: +lng.toFixed(5), lat: +lat.toFixed(5) });
  }

  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  await writeFile(
    OUT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source:
          "gearbooker.com (sitemaps, robots.txt-conform) — prototype-data, niet herpubliceren",
        count: withCoords.length,
        failed,
        studios: withCoords,
      },
      null,
      2
    )
  );

  /* Slanke variant voor de kaart (client-bundle): zonder volledige
   * beschrijvingen — alleen wat de kaart-UI nodig heeft. */
  await writeFile(
    path.join(OUT_DIR, "studios.map.json"),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      studios: withCoords.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        type: s.type,
        city: s.city,
        lng: s.lng,
        lat: s.lat,
        url: s.url,
        image: s.image,
        prices: s.prices,
        specs: s.specs,
        desc:
          s.description.length > 220
            ? `${s.description.slice(0, 217).replace(/\n+/g, " ")}…`
            : s.description.replace(/\n+/g, " "),
      })),
    })
  );

  const perType = {};
  for (const s of withCoords) perType[s.type] = (perType[s.type] ?? 0) + 1;
  console.log(`\nklaar: ${withCoords.length} studio's → data/studios.json`);
  console.log("per type:", perType);
  console.log("mislukt:", failed.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
