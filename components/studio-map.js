"use client";

import clsx from "clsx";
import maplibregl from "maplibre-gl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Typography } from "@/components/typography";
import { track } from "@/lib/analytics";
import mapData from "@/data/studios.map.json";

import "maplibre-gl/dist/maplibre-gl.css";

/* De kaart — het product van Kader: elke studio in beeld, op één kaart.
 *
 * - MapLibre + OpenFreeMap vector tiles, hergekleurd naar het merkpalet.
 * - Studio-pin klikken → detailkaart linksboven; verdwijnt zodra je met de
 *   kaart interacteert of ernaast klikt.
 * - Cluster klikken → paneel dat rechts inschuift (schermhoog minus marge)
 *   met een scrollbare lijst van de studio's in dat cluster.
 * - Klik op lege kaart zet een eigen pin, klik op een eigen pin haalt 'm weg.
 */

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/* Kaartthema — vlak, neutraal, zoals een studio zelf. */
const MAP_THEME = {
    land: "#EDEDEA",
    green: "#E3E7DF",
    water: "#DBDCD5",
    building: "#E3E3DD",
    road: "#FFFFFF",
    boundary: "#C9C9C2",
    text: "#5D5D59",
    halo: "#EDEDEA",
};

const PIN_COLOR = { fill: "#00B140", stroke: "#FFFFFF" };

const TYPE_LABELS = { foto: "Foto", podcast: "Podcast", muziek: "Muziek" };
const TYPE_BADGE = {
    Foto: { bg: "#171716", fg: "#EDEDEA" },
    Podcast: { bg: "#2F4DE0", fg: "#FFFFFF" },
    Muziek: { bg: "#D8CBB8", fg: "#171716" },
};

function specsLine(specs) {
    const parts = [];
    if (specs.areaM2) parts.push(`${specs.areaM2} m²`);
    if (specs.ceilingM)
        parts.push(`plafond ${String(specs.ceilingM).replace(".", ",")} m`);
    if (specs.cyclorama) parts.push("limbowand");
    if (specs.greenscreen) parts.push("greenscreen");
    if (specs.daylight) parts.push("daglicht");
    if (specs.parking) parts.push("parkeren");
    if (specs.blackout) parts.push("verduisterbaar");
    return parts.join(" · ");
}

const eur = (v) => `€${v % 1 ? v.toFixed(2).replace(".", ",") : v}`;

/* Prijsweergave: uurprijs als die er is, anders de eerste-dagprijs.
 * Losse tarieven (eerste dag duurder dan extra dagen!) apart als regel. */
function priceLabel(prices) {
    if (prices.hourEUR) return `${eur(prices.hourEUR)}/uur`;
    if (prices.firstDayEUR) return `${eur(prices.firstDayEUR)}/dag`;
    return "";
}

function priceTiers(prices) {
    const parts = [];
    if (prices.firstDayEUR) parts.push(`1e dag ${eur(prices.firstDayEUR)}`);
    if (prices.extraDayEUR) parts.push(`extra dag ${eur(prices.extraDayEUR)}`);
    if (prices.weekEUR) parts.push(`week ${eur(prices.weekEUR)}`);
    return parts.join(" · ");
}

/* Gescrapete studio's (scripts/scrape-studios.mjs) → GeoJSON features.
 * Alleen platte props: geneste objecten worden door MapLibre gestringifyd. */
const STUDIO_FEATURES = mapData.studios.map((s) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [s.lng, s.lat] },
    properties: {
        id: s.id,
        slug: s.slug,
        kind: "studio",
        name: s.name,
        city: s.city ?? "",
        studioType: TYPE_LABELS[s.type] ?? s.type,
        priceLabel: priceLabel(s.prices),
        priceTiers: priceTiers(s.prices),
        priceSort: s.prices.hourEUR ?? s.prices.firstDayEUR ?? 0,
        url: s.url,
        image: s.image ?? "",
        description: s.desc ?? "",
        specsLine: specsLine(s.specs),
        // booleans voor de filterchips
        cyclorama: !!s.specs.cyclorama,
        daylight: !!s.specs.daylight,
        greenscreen: !!s.specs.greenscreen,
        parking: !!s.specs.parking,
    },
}));

const SPEC_LABELS = {
    cyclorama: "limbowand",
    daylight: "daglicht",
    greenscreen: "greenscreen",
    parking: "parkeren",
};

const TYPE_CHIP_ACTIVE = {
    Foto: "border-flag bg-flag text-cyc",
    Podcast: "border-gel bg-gel text-white",
    Muziek: "border-papier bg-papier text-flag",
};

const featureCollection = (features) => ({
    type: "FeatureCollection",
    features,
});

/* Herkleur alle stijllagen naar het merkpalet — op laagtype + id-heuristiek. */
function applyMapTheme(map, t) {
    const layers = map.getStyle()?.layers ?? [];

    for (const layer of layers) {
        const { id, type } = layer;
        if (id.startsWith("kader-")) continue;
        const lid = id.toLowerCase();

        try {
            switch (type) {
                case "background":
                    map.setPaintProperty(id, "background-color", t.land);
                    break;
                case "fill": {
                    let color = t.land;
                    if (/water|ocean|river|lake/.test(lid)) color = t.water;
                    else if (/building/.test(lid)) color = t.building;
                    else if (
                        /park|grass|wood|forest|green|landcover|landuse|vegetation|cemetery|pitch|garden|sand/.test(
                            lid,
                        )
                    )
                        color = t.green;
                    map.setPaintProperty(id, "fill-color", color);
                    map.setPaintProperty(id, "fill-outline-color", color);
                    break;
                }
                case "line": {
                    let color = t.road;
                    if (/water|river|waterway|canal|stream/.test(lid))
                        color = t.water;
                    else if (/boundary|admin/.test(lid)) color = t.boundary;
                    map.setPaintProperty(id, "line-color", color);
                    break;
                }
                case "symbol":
                    map.setPaintProperty(id, "text-color", t.text);
                    map.setPaintProperty(id, "text-halo-color", t.halo);
                    break;
                default:
                    break;
            }
        } catch {
            /* laag zonder deze property — overslaan */
        }
    }
}

/* ---------- Bubbel-markers ---------- */

const ANIM_MS = 350;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
/* Transform en opacity lopen even lang: bubbel en getal verdwijnen tegelijk. */
const TRANSITION = `transform ${ANIM_MS}ms ${EASE}, opacity ${ANIM_MS}ms ${EASE}`;
const MATCH_PX = 130; // max afstand om een morph-partner te vinden

function bubbleSpec(props) {
    if (props.cluster) {
        const n = props.point_count;
        const d = n < 5 ? 34 : n < 15 ? 44 : n < 50 ? 54 : 64;
        const fs = n < 5 ? 13 : n < 15 ? 14 : n < 50 ? 16 : 18;
        return { d, fs, label: String(props.point_count_abbreviated ?? n) };
    }
    return { d: 18, fs: 0, label: "" };
}

function makeBubbleEl(spec, color) {
    const el = document.createElement("div");
    el.style.cursor = "pointer";
    el.style.zIndex = String(spec.d); // grote clusters bovenop

    const inner = document.createElement("div");
    inner.style.cssText = [
        "display:flex",
        "align-items:center",
        "justify-content:center",
        `width:${spec.d}px`,
        `height:${spec.d}px`,
        "border-radius:9999px",
        `background:${color}`,
        "border:2.5px solid #ffffff",
        "box-shadow:0 3px 12px rgba(23,23,22,0.28)",
        "color:#ffffff",
        `font:700 ${spec.fs}px var(--font-sans), sans-serif`,
        "letter-spacing:-0.02em",
        "user-select:none",
        "will-change:transform,opacity",
        `transition:${TRANSITION}`,
    ].join(";");
    if (spec.label) inner.textContent = spec.label;

    el.appendChild(inner);
    return { el, inner };
}

export function StudioMap() {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef(new Map());
    const cardRef = useRef(null);
    const openRef = useRef({ card: false, sheet: false });

    const [card, setCard] = useState(null);
    const [sheet, setSheet] = useState({ open: false, items: [] });
    const [types, setTypes] = useState({
        Foto: true,
        Podcast: true,
        Muziek: true,
    });
    const [specs, setSpecs] = useState({
        cyclorama: false,
        daylight: false,
        greenscreen: false,
        parking: false,
    });

    const filtersRef = useRef({ types, specs });

    useEffect(() => {
        openRef.current = { card: !!card, sheet: sheet.open };
    }, [card, sheet]);

    const closeAll = () => {
        setCard(null);
        setSheet((s) => ({ ...s, open: false }));
    };

    /* Filters → source-data. Clusters herberekenen vanzelf en de bubbels
     * morphen mee. */
    const syncData = () => {
        const source = mapRef.current?.getSource("kader-studios");
        if (!source) return;
        const { types: t, specs: sp } = filtersRef.current;
        const studios = STUDIO_FEATURES.filter((f) => {
            const p = f.properties;
            if (!t[p.studioType]) return false;
            for (const key of Object.keys(sp)) {
                if (sp[key] && !p[key]) return false;
            }
            return true;
        });
        source.setData(featureCollection(studios));
    };

    useEffect(() => {
        filtersRef.current = { types, specs };
        syncData();
    }, [types, specs]);

    useEffect(() => {
        if (mapRef.current) return;

        const registry = markersRef.current;

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: STYLE_URL,
            center: [5.29, 52.15],
            zoom: 6.5,
            minZoom: 5,
            maxZoom: 17,
            attributionControl: { compact: true },
        });
        mapRef.current = map;

        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();

        if (process.env.NODE_ENV === "development") {
            window.__kaderMap = map;
            window.__kaderMarkers = registry;
        }

        /* Diff van zichtbare clusters/pins → markers aanmaken, morphen, opruimen. */
        const updateMarkers = () => {
            const source = map.getSource("kader-studios");
            if (!source) return;

            const next = new Map();
            for (const f of map.querySourceFeatures("kader-studios")) {
                const key = f.properties.cluster
                    ? `c-${f.properties.cluster_id}`
                    : f.properties.id;
                if (!next.has(key)) next.set(key, f);
            }

            // stervende marker die terugkomt? weer tot leven wekken
            for (const [key, entry] of registry) {
                if (entry.dying && next.has(key)) {
                    clearTimeout(entry.timeout);
                    entry.dying = false;
                    entry.inner.style.opacity = "1";
                    entry.inner.style.transform =
                        "translate(0px, 0px) scale(1)";
                }
            }

            const removed = [];
            for (const [key, entry] of registry) {
                if (!next.has(key) && !entry.dying) removed.push([key, entry]);
            }
            const added = [];
            for (const [key, f] of next) {
                if (!registry.has(key)) added.push([key, f]);
            }
            if (!removed.length && !added.length) return;

            const removedPx = removed.map(([, entry]) =>
                map.project(entry.lngLat),
            );
            const nextPx = [...next.values()].map((f) =>
                map.project(f.geometry.coordinates),
            );
            const nearest = (own, candidates) => {
                let best = null;
                let bestDist = MATCH_PX;
                for (const px of candidates) {
                    const dist = Math.hypot(px.x - own.x, px.y - own.y);
                    if (dist < bestDist) {
                        bestDist = dist;
                        best = px;
                    }
                }
                return best;
            };

            // nieuwe bubbels: morphen uit de dichtstbijzijnde verdwijnende bubbel
            for (const [key, f] of added) {
                const coords = f.geometry.coordinates.slice();
                const own = map.project(coords);
                const origin = nearest(own, removedPx);
                const spec = bubbleSpec(f.properties);
                const { el, inner } = makeBubbleEl(spec, PIN_COLOR.fill);
                const props = f.properties;

                el.addEventListener("click", (ev) => {
                    ev.stopPropagation();
                    if (props.cluster) {
                        source
                            .getClusterLeaves(
                                props.cluster_id,
                                props.point_count,
                                0,
                            )
                            .then((leaves) => {
                                const items = leaves
                                    .map((l) => ({
                                        ...l.properties,
                                        coords: l.geometry.coordinates.slice(),
                                    }))
                                    .sort(
                                        (a, b) =>
                                            a.city.localeCompare(b.city) ||
                                            a.priceSort - b.priceSort,
                                    );
                                setCard(null);
                                setSheet({ open: true, items });
                                track("cluster_open", {
                                    count: items.length,
                                    cities: [
                                        ...new Set(items.map((i) => i.city)),
                                    ]
                                        .slice(0, 5)
                                        .join(","),
                                });
                            })
                            .catch(() => {});
                    } else {
                        setSheet((s) => ({ ...s, open: false }));
                        setCard({ ...props, coords });
                        track("studio_open", {
                            studio_id: props.id,
                            studio_name: props.name,
                            city: props.city,
                            studio_type: props.studioType,
                            price: props.priceSort,
                            source: "pin",
                        });
                    }
                });

                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat(coords)
                    .addTo(map);
                registry.set(key, {
                    marker,
                    el,
                    inner,
                    lngLat: coords,
                    dying: false,
                    timeout: null,
                });

                inner.style.transition = "none";
                if (origin) {
                    // uit de oude bubbel komen — geen fade, puur morph
                    inner.style.transform = `translate(${origin.x - own.x}px, ${origin.y - own.y}px) scale(0.4)`;
                } else {
                    // vers (nieuwe pin, of ingepand) — ter plekke opduiken
                    inner.style.opacity = "0";
                    inner.style.transform = "scale(0.4)";
                }
                inner.getBoundingClientRect(); // reflow zodat de start-stand vaststaat
                requestAnimationFrame(() => {
                    inner.style.transition = TRANSITION;
                    inner.style.opacity = "1";
                    inner.style.transform = "translate(0px, 0px) scale(1)";
                });
            }

            // verdwijnende bubbels: in hun nieuwe cluster morphen en tegelijk faden
            for (const [key, entry] of removed) {
                const own = map.project(entry.lngLat);
                const target = nearest(own, nextPx);
                entry.dying = true;
                entry.el.style.pointerEvents = "none";
                entry.el.style.zIndex = "0"; // onder de nieuwe bubbel schuiven
                entry.inner.style.transition = TRANSITION;
                entry.inner.style.transform = target
                    ? `translate(${target.x - own.x}px, ${target.y - own.y}px) scale(0.4)`
                    : "scale(0.4)";
                entry.inner.style.opacity = "0";
                entry.timeout = setTimeout(() => {
                    entry.marker.remove();
                    registry.delete(key);
                }, ANIM_MS + 50);
            }
        };

        let rafId = 0;
        const scheduleUpdate = () => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                rafId = 0;
                updateMarkers();
            });
        };

        map.on("load", () => {
            map.addSource("kader-studios", {
                type: "geojson",
                data: featureCollection(STUDIO_FEATURES),
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 55,
            });

            /* Zonder laag laadt MapLibre de source-tiles niet en geeft
             * querySourceFeatures niets terug — dus één onzichtbaar anker. */
            map.addLayer({
                id: "kader-source-anchor",
                type: "circle",
                source: "kader-studios",
                paint: { "circle-radius": 0, "circle-opacity": 0 },
            });

            applyMapTheme(map, MAP_THEME);

            // deep link vanaf een detailpagina: /?studio=<id> → focus + kaart open
            const focusId = new URLSearchParams(window.location.search).get(
                "studio",
            );
            if (focusId) {
                const f = STUDIO_FEATURES.find(
                    (x) => x.properties.id === focusId,
                );
                if (f) {
                    map.jumpTo({ center: f.geometry.coordinates, zoom: 14 });
                    setCard({
                        ...f.properties,
                        coords: f.geometry.coordinates.slice(),
                    });
                    track("studio_open", {
                        studio_id: f.properties.id,
                        studio_name: f.properties.name,
                        city: f.properties.city,
                        studio_type: f.properties.studioType,
                        price: f.properties.priceSort,
                        source: "deeplink",
                    });
                }
            }
        });

        map.on("sourcedata", (e) => {
            if (e.sourceId === "kader-studios") scheduleUpdate();
        });
        map.on("zoom", scheduleUpdate);
        map.on("moveend", scheduleUpdate);
        map.on("idle", scheduleUpdate);

        // klik op lege kaart sluit alleen open overlays — pins zetten kan niet
        map.on("click", () => {
            setCard(null);
            setSheet((s) => ({ ...s, open: false }));
        });

        // interactie met de kaart (slepen, scrollen, pinchen) sluit de detailkaart
        map.on("movestart", (e) => {
            if (e.originalEvent && openRef.current.card) setCard(null);
        });

        return () => {
            cancelAnimationFrame(rafId);
            for (const [, entry] of registry) clearTimeout(entry.timeout);
            registry.clear();
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Escape sluit kaart en paneel
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") closeAll();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const openFromList = (item) => {
        setSheet((s) => ({ ...s, open: false }));
        setCard(item);
        track("studio_open", {
            studio_id: item.id,
            studio_name: item.name,
            city: item.city,
            studio_type: item.studioType,
            price: item.priceSort,
            source: "cluster_list",
        });
        mapRef.current?.easeTo({
            center: item.coords,
            zoom: Math.max(mapRef.current.getZoom(), 12),
        });
    };

    const flyToPlace = (result) => {
        const map = mapRef.current;
        if (!map) return;
        closeAll();
        const bb = result.boundingbox?.map(Number);
        if (bb?.length === 4) {
            map.fitBounds(
                [
                    [bb[2], bb[0]],
                    [bb[3], bb[1]],
                ],
                { padding: 80, maxZoom: 14.5, duration: 1800 },
            );
        } else {
            map.flyTo({
                center: [Number(result.lon), Number(result.lat)],
                zoom: 12,
            });
        }
    };

    const sheetCities = [...new Set(sheet.items.map((i) => i.city))];

    return (
        <div className="relative h-dvh w-full overflow-hidden bg-cyc">
            {/* maplibre-css zet position:relative op dit element — dus expliciet h/w.
          isolate: eigen stacking context, zodat de bubbels (met z-index)
          altijd ónder de kaart-overlays blijven */}
            <div ref={containerRef} className="isolate h-full w-full" />

            {/* Zoekbalk — naast de menuknop */}
            <div className="absolute left-[4.75rem] w-[calc(100vw-6rem)] sm:w-[263px] top-4 z-30">
                <PlaceSearch
                    onPick={flyToPlace}
                    onFocusInput={() => setCard(null)}
                />
            </div>

            {/* Filters + detailkaart linksboven, onder de menuknop */}
            <div className="absolute left-4 top-[4.5rem] z-10 flex max-w-[calc(100vw-2rem)] flex-col items-start gap-3">
                <div className="flex max-w-[400px] flex-wrap gap-2">
                    {Object.keys(types).map((t) => (
                        <FilterChip
                            key={t}
                            label={t}
                            active={types[t]}
                            activeClass={TYPE_CHIP_ACTIVE[t]}
                            onClick={() => {
                                track("filter_toggle", {
                                    filter: t,
                                    enabled: !types[t],
                                });
                                setTypes((v) => ({ ...v, [t]: !v[t] }));
                            }}
                        />
                    ))}
                    {Object.keys(specs).map((s) => (
                        <FilterChip
                            key={s}
                            label={SPEC_LABELS[s]}
                            active={specs[s]}
                            dot
                            activeClass="border-flag bg-white text-flag"
                            onClick={() => {
                                track("filter_toggle", {
                                    filter: SPEC_LABELS[s],
                                    enabled: !specs[s],
                                });
                                setSpecs((v) => ({ ...v, [s]: !v[s] }));
                            }}
                        />
                    ))}
                </div>

                {card && (
                    <div
                        ref={cardRef}
                        data-theme="white"
                        className="kader-card-in cyc-shape-s w-[300px] overflow-hidden border border-line bg-background shadow-[0_10px_30px_-15px_rgba(23,23,22,0.35)]"
                    >
                        {card.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={card.image}
                                alt={card.name}
                                className="h-36 w-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        ) : null}
                        <div className="p-5">
                            <div className="flex items-center gap-2">
                                <TypeBadge type={card.studioType} />
                                <Typography
                                    type="caption"
                                    className="opacity-60"
                                >
                                    {card.city}
                                </Typography>
                            </div>
                            <div className="mt-2 font-display text-[17px] font-bold leading-tight tracking-[-0.02em]">
                                {card.name}
                            </div>
                            {card.specsLine ? (
                                <Typography
                                    type="caption"
                                    as="p"
                                    className="mt-2 opacity-70"
                                >
                                    {card.specsLine}
                                </Typography>
                            ) : null}
                            {card.description ? (
                                <p className="mt-2 line-clamp-3 text-[13px] leading-snug opacity-70">
                                    {card.description}
                                </p>
                            ) : null}
                            <div className="mt-3 flex items-baseline justify-between gap-3">
                                {card.priceLabel ? (
                                    <Typography
                                        type="spec"
                                        className="text-[13px] font-medium"
                                    >
                                        {card.priceLabel}
                                    </Typography>
                                ) : (
                                    <span />
                                )}
                                <Link
                                    href={`/studio/${card.slug}`}
                                    className="whitespace-nowrap text-[13px] font-semibold text-chroma"
                                    onClick={() =>
                                        track("detail_click", {
                                            studio_id: card.id,
                                            studio_name: card.name,
                                        })
                                    }
                                >
                                    Bekijk studio →
                                </Link>
                            </div>
                            {card.priceTiers ? (
                                <Typography
                                    type="caption"
                                    as="p"
                                    className="mt-1.5 opacity-60"
                                >
                                    {card.priceTiers}
                                </Typography>
                            ) : null}
                            <Typography
                                type="caption"
                                as="p"
                                className="mt-2 opacity-40"
                            >
                                via gearbooker.com
                            </Typography>
                        </div>
                    </div>
                )}
            </div>

            {/* Cluster-paneel: schuift rechts in, schermhoog minus marge */}
            <div
                className={`absolute bottom-4 right-4 top-4 z-20 w-[380px] max-w-[calc(100vw-2rem)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    sheet.open
                        ? "translate-x-0"
                        : "pointer-events-none translate-x-[calc(100%+1.5rem)]"
                }`}
            >
                <div
                    data-theme="white"
                    className="cyc-shape flex h-full flex-col overflow-hidden border border-line bg-background shadow-[0_10px_40px_-15px_rgba(23,23,22,0.45)]"
                >
                    <div className="flex items-start justify-between gap-3 px-6 pb-4 pt-6">
                        <div>
                            <Typography
                                type="label"
                                as="div"
                                className="opacity-50"
                            >
                                In dit cluster
                            </Typography>
                            <h3 className="mt-1">{`${sheet.items.length} studio's`}</h3>
                            <Typography
                                type="caption"
                                as="div"
                                className="mt-0.5 opacity-60"
                            >
                                {sheetCities.length === 1
                                    ? sheetCities[0]
                                    : `${sheetCities.length} plaatsen`}
                                {" · via gearbooker.com"}
                            </Typography>
                        </div>
                        <button
                            type="button"
                            aria-label="Sluit lijst"
                            onClick={() =>
                                setSheet((s) => ({ ...s, open: false }))
                            }
                            className="focusable flex-center h-9 w-9 cursor-pointer rounded-full border border-line font-mono text-sm text-flag transition-colors duration-200 hover:bg-cyc"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        {sheet.items.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => openFromList(item)}
                                className="w-full cursor-pointer border-t border-dashed border-line py-3.5 text-left first:border-t-0"
                            >
                                <div className="flex items-center gap-2">
                                    <TypeBadge type={item.studioType} />
                                    <Typography
                                        type="caption"
                                        className="opacity-60"
                                    >
                                        {item.city}
                                    </Typography>
                                    {item.priceLabel ? (
                                        <Typography
                                            type="caption"
                                            className="ml-auto opacity-80"
                                        >
                                            {item.priceLabel}
                                        </Typography>
                                    ) : null}
                                </div>
                                <div className="mt-1.5 text-[15px] font-semibold leading-snug">
                                    {item.name}
                                </div>
                                {item.specsLine ? (
                                    <Typography
                                        type="caption"
                                        as="div"
                                        className="mt-1 opacity-60"
                                    >
                                        {item.specsLine}
                                    </Typography>
                                ) : null}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Zoomknoppen */}
            <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-2">
                <ZoomButton
                    onClick={() => {
                        setCard(null);
                        mapRef.current?.zoomIn();
                    }}
                    label="Zoom in"
                >
                    +
                </ZoomButton>
                <ZoomButton
                    onClick={() => {
                        setCard(null);
                        mapRef.current?.zoomOut();
                    }}
                    label="Zoom uit"
                >
                    −
                </ZoomButton>
            </div>
        </div>
    );
}

/* Filterchip — type-chips kleuren in badge-kleur als ze aanstaan,
 * spec-chips krijgen een chroma-stip. Uit = wit en gedimd. */
function FilterChip({ label, active, activeClass, dot = false, onClick }) {
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            className={clsx(
                "focusable flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] shadow-[0_10px_30px_-15px_rgba(23,23,22,0.25)] transition-colors duration-200",
                active
                    ? activeClass
                    : "border-line bg-white text-flag/45 hover:text-flag",
            )}
        >
            {dot && active && (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-chroma" />
            )}
            {label}
        </button>
    );
}

/* Zoekbalk voor een plaats — Nominatim (NL/BE), debounced suggesties;
 * kiezen vliegt de kaart naar de bounding box van de plaats. */
function PlaceSearch({ onPick, onFocusInput }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null); // null = nog niets gezocht
    const [listOpen, setListOpen] = useState(false);
    const abortRef = useRef(null);
    const debounceRef = useRef(null);
    const resultsForRef = useRef(""); // bij welke query horen de resultaten

    const fetchPlaces = async (q) => {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=nl,be&format=json&limit=5`,
            { signal: ctrl.signal },
        );
        return res.json();
    };

    const search = async (q) => {
        if (q.trim().length < 2) {
            setResults(null);
            setListOpen(false);
            return;
        }
        try {
            const data = await fetchPlaces(q);
            resultsForRef.current = q;
            setResults(data);
            setListOpen(true);
        } catch {
            /* afgebroken of offline */
        }
    };

    const onChange = (e) => {
        const v = e.target.value;
        setQuery(v);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(v), 400);
    };

    const pick = (r) => {
        setQuery(r.display_name.split(",")[0]);
        setListOpen(false);
        track("place_search", { place: r.display_name.split(",")[0] });
        onPick(r);
    };

    const onKeyDown = async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            clearTimeout(debounceRef.current);
            const q = query;
            if (q.trim().length < 2) return;
            // resultaten al binnen voor precies deze query → direct de eerste
            if (results?.length && resultsForRef.current === q) {
                pick(results[0]);
                return;
            }
            // anders meteen zoeken (niet op de debounce wachten) en de eerste nemen
            try {
                const data = await fetchPlaces(q);
                resultsForRef.current = q;
                setResults(data);
                if (data[0]) pick(data[0]);
                else setListOpen(true); // toon "geen resultaten"
            } catch {
                /* afgebroken of offline */
            }
        }
        if (e.key === "Escape") {
            e.stopPropagation();
            setListOpen(false);
            e.currentTarget.blur();
        }
    };

    return (
        <div className="relative">
            <div className="flex h-11 items-center gap-2.5 rounded-full border border-line bg-white pl-4 pr-4 shadow-[0_10px_30px_-15px_rgba(23,23,22,0.35)]">
                <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="h-4 w-4 shrink-0 opacity-45"
                    aria-hidden
                >
                    <circle
                        cx="7"
                        cy="7"
                        r="5"
                        stroke="#171716"
                        strokeWidth="1.6"
                    />
                    <path
                        d="M11 11 L14.5 14.5"
                        stroke="#171716"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    onFocus={() => {
                        onFocusInput?.();
                        if (results?.length) setListOpen(true);
                    }}
                    onBlur={() => setListOpen(false)}
                    placeholder="Zoek een plaats"
                    aria-label="Zoek een plaats"
                    className="w-[150px] bg-transparent font-sans text-[15px] text-flag outline-none placeholder:text-flag/40 sm:w-[200px]"
                />
            </div>

            {listOpen && results && (
                /* mousedown preventDefault: anders blurt de input vóór de klik landt */
                <div
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute left-0 top-[52px] w-[280px] overflow-hidden rounded-[10px_10px_22px_22px] border border-line bg-white shadow-[0_10px_30px_-15px_rgba(23,23,22,0.35)]"
                >
                    {results.length ? (
                        results.map((r) => (
                            <button
                                key={r.place_id}
                                type="button"
                                onClick={() => pick(r)}
                                className="block w-full cursor-pointer border-t border-dashed border-line px-4 py-3 text-left transition-colors duration-150 first:border-t-0 hover:bg-cyc"
                            >
                                <div className="text-[14px] font-semibold leading-tight">
                                    {r.display_name.split(",")[0]}
                                </div>
                                <div className="truncate font-mono text-[11px] opacity-55">
                                    {r.display_name
                                        .split(",")
                                        .slice(1)
                                        .join(",")
                                        .trim()}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 font-mono text-[12px] opacity-55">
                            geen resultaten
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function TypeBadge({ type }) {
    const { bg, fg } = TYPE_BADGE[type] ?? TYPE_BADGE.Foto;
    return (
        <span
            className="inline-block rounded-md px-2 py-1 font-mono text-[10px] font-medium tracking-[0.08em] uppercase"
            style={{ background: bg, color: fg }}
        >
            {type}
        </span>
    );
}

function ZoomButton({ onClick, label, children }) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className="focusable flex-center h-11 w-11 cursor-pointer rounded-full border border-line bg-white font-mono text-lg text-flag shadow-[0_10px_30px_-15px_rgba(23,23,22,0.35)] transition-colors duration-200 hover:bg-cyc"
        >
            {children}
        </button>
    );
}
