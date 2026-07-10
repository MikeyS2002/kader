#!/usr/bin/env node
/* Studio-discovery via Google Places API (New).
 *
 * Zoekt per stad × type naar verhuurstudio's en schrijft een KANDIDATENLIJST
 * (naam, website, adres) naar data/studio-kandidaten.json. Die lijst is
 * werkmateriaal voor curatie: we bezoeken daarna de eigen site van elke
 * studio en nemen alleen dáár geverifieerde feiten op in
 * data/studios-direct.json.
 *
 * BELANGRIJK (Google ToS): Places-data mag niet op een niet-Google-kaart
 * getoond of langdurig opgeslagen worden. Daarom publiceren we niets uit
 * dit bestand — het is een tijdelijke leadlijst (staat in .gitignore) en
 * de gepubliceerde data komt altijd van de studio's eigen site.
 *
 * Setup:  zet GOOGLE_PLACES_KEY in .env.local (Places API (New) aan in
 *         Google Cloud). Gebruik: node scripts/discover-studios.mjs
 * Opties: --stad=amsterdam (één stad), --type=podcast (één type)
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_FILE = path.join(process.cwd(), "data", "studio-kandidaten.json");

const CITIES = [
  "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Groningen",
  "Tilburg", "Almere", "Breda", "Nijmegen", "Arnhem", "Haarlem", "Amersfoort",
  "Zwolle", "Leiden", "Maastricht", "Den Bosch", "Enschede", "Apeldoorn",
  "Antwerpen", "Gent",
];

const QUERIES = {
  foto: (city) => `fotostudio huren ${city}`,
  podcast: (city) => `podcaststudio huren ${city}`,
  muziek: (city) => `muziekstudio verhuur ${city}`,
};

async function loadKey() {
  if (process.env.GOOGLE_PLACES_KEY) return process.env.GOOGLE_PLACES_KEY;
  try {
    const env = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
    const match = env.match(/^GOOGLE_PLACES_KEY=(.+)$/m);
    if (match) return match[1].trim();
  } catch {
    /* geen .env.local */
  }
  return null;
}

const normName = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "");

async function knownStudioKeys() {
  const keys = new Set();
  for (const file of ["studios.json", "studios-direct.json"]) {
    try {
      const data = JSON.parse(
        await readFile(path.join(process.cwd(), "data", file), "utf8")
      );
      for (const s of data.studios ?? []) keys.add(normName(s.name));
    } catch {
      /* bestand ontbreekt */
    }
  }
  return keys;
}

async function searchText(key, query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.displayName,places.websiteUri,places.formattedAddress",
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: "nl",
      regionCode: "NL",
      pageSize: 20,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Places API ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.places ?? [];
}

async function main() {
  const key = await loadKey();
  if (!key) {
    console.error(
      [
        "Geen GOOGLE_PLACES_KEY gevonden.",
        "",
        "Setup (eenmalig, ±5 min):",
        "  1. console.cloud.google.com → project → 'Places API (New)' aanzetten",
        "  2. API-key aanmaken (beperk tot Places API) + budget-alert instellen",
        "  3. In .env.local:  GOOGLE_PLACES_KEY=AIza...",
        "",
        "Daarna:  node scripts/discover-studios.mjs",
      ].join("\n")
    );
    process.exit(1);
  }

  const cityArg = process.argv.find((a) => a.startsWith("--stad="))?.slice(7);
  const typeArg = process.argv.find((a) => a.startsWith("--type="))?.slice(7);
  const cities = cityArg
    ? CITIES.filter((c) => c.toLowerCase() === cityArg.toLowerCase())
    : CITIES;
  const types = typeArg ? [typeArg] : Object.keys(QUERIES);

  const known = await knownStudioKeys();
  const seen = new Set();
  const candidates = [];
  let requests = 0;

  for (const city of cities) {
    for (const type of types) {
      if (!QUERIES[type]) continue;
      const query = QUERIES[type](city);
      let places = [];
      try {
        places = await searchText(key, query);
        requests += 1;
      } catch (e) {
        console.error(`mislukt: "${query}" — ${e.message}`);
        continue;
      }
      for (const p of places) {
        const name = p.displayName?.text ?? "";
        if (!name || seen.has(normName(name))) continue;
        seen.add(normName(name));
        candidates.push({
          name,
          alreadyListed: known.has(normName(name)),
          website: p.websiteUri ?? null,
          address: p.formattedAddress ?? null,
          city,
          type,
          query,
        });
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    console.log(`${city}: ${candidates.length} kandidaten totaal`);
  }

  const fresh = candidates.filter((c) => !c.alreadyListed && c.website);
  await writeFile(
    OUT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        note: "Tijdelijke leadlijst (Google Places) — alleen voor curatie, niet publiceren of committen.",
        requests,
        total: candidates.length,
        newWithWebsite: fresh.length,
        candidates,
      },
      null,
      2
    )
  );

  console.log(
    `\nklaar: ${candidates.length} kandidaten (${fresh.length} nieuw mét website, ${requests} API-calls)`
  );
  console.log(`→ ${OUT_FILE}`);
  console.log("volgende stap: sites bezoeken en cureren in data/studios-direct.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
