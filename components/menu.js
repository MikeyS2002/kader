"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { KaderMark } from "@/components/kader-mark";

/* Fullscreen menu — wit met lichte transparantie en blur, items groot in
 * de display-stem, gecentreerd; beeldmerk bovenaan in het midden.
 *
 * Entree-animaties zijn one-shot CSS-animaties die alleen bij het openen
 * draaien (de inhoud wordt per opening opnieuw gemount via een key). Bij
 * het sluiten beweegt er dus niets: alleen de overlay fadet uit. */

const ITEMS = [
  { href: "/", label: "kaart" },
  { href: "/fotostudio-huren", label: "fotostudio's" },
  { href: "/podcaststudio-huren", label: "podcaststudio's" },
  { href: "/muziekstudio-huren", label: "muziekstudio's" },
];

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function Menu() {
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const pathname = usePathname();

  const openMenu = () => {
    setOpenCount((c) => c + 1); // verse key → entree-animatie opnieuw
    setOpen(true);
  };
  const closeMenu = () => setOpen(false);

  /* Pas sluiten als de route écht gewisseld is — bij sluiten op de klik
   * zie je de oude pagina nog even onder de fade voordat de nieuwe laadt.
   * (state-adjustment tijdens render, zie react.dev "adjusting state when
   * a prop changes") */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Toetsenbord: bij open menu wordt de rest van de pagina inert (Tab kan
   * er niet meer in — feitelijk een focus-trap) en gaat de focus naar het
   * eerste menu-item; bij sluiten terug naar de menuknop. */
  const overlayRef = useRef(null);
  const buttonRef = useRef(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const overlay = overlayRef.current;
    const button = buttonRef.current;
    const others = [...document.body.children].filter(
      (el) => el !== overlay && el !== button && el.tagName !== "SCRIPT"
    );

    if (open) {
      for (const el of others) el.setAttribute("inert", "");
      overlay?.querySelector("a")?.focus();
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      for (const el of others) el.removeAttribute("inert");
      button?.focus();
      wasOpenRef.current = false;
    }

    return () => {
      for (const el of others) el.removeAttribute("inert");
    };
  }, [open]);

  /* Scroll-lock mét gutter-compensatie: als de scrollbar verdwijnt of
   * terugkomt mag de layout niet verspringen tijdens de fade. */
  useEffect(() => {
    const el = document.documentElement;
    if (open) {
      const gutter = window.innerWidth - el.clientWidth;
      el.style.overflow = "hidden";
      if (gutter > 0) el.style.paddingRight = `${gutter}px`;
    } else {
      el.style.overflow = "";
      el.style.paddingRight = "";
    }
    return () => {
      el.style.overflow = "";
      el.style.paddingRight = "";
    };
  }, [open]);

  return (
    <>
      {/* overlay */}
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        onClick={closeMenu}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-white/75 backdrop-blur-xl transition-opacity duration-[400ms] ease-out ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div key={openCount} className="contents">
          {/* beeldmerk bovenaan in het midden */}
          <div
            className="absolute left-1/2 top-8 -translate-x-1/2 text-flag"
            style={{ animation: `kader-drop-in 500ms ${EASE} 60ms both` }}
          >
            <KaderMark className="h-12 w-12" />
          </div>

          <nav className="flex flex-col items-center gap-3">
            {ITEMS.map((item, i) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    // zelfde pagina: geen routewissel, dus direct sluiten
                    if (item.href === pathname) closeMenu();
                  }}
                  tabIndex={open ? 0 : -1}
                  className="focusable group font-display text-[clamp(36px,7vw,72px)] font-extrabold lowercase leading-none tracking-[-0.04em] text-flag no-underline hover:no-underline"
                  style={{
                    animation: `kader-rise-in 500ms ${EASE} ${120 + i * 80}ms both`,
                  }}
                >
                  {/* hover: eigen korte transitie, geen delay */}
                  <span className="relative inline-block transition-opacity duration-200 group-hover:opacity-40">
                    {item.label}
                    {active && (
                      /* absolute: telt niet mee in de breedte, dus de tekst
                         verschuift niet als het actieve item wisselt */
                      <span className="absolute left-full top-1/2 ml-4 h-[0.14em] w-[0.14em] -translate-y-1/2 rounded-full bg-chroma" />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* hamburger / sluitknop */}
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? "Sluit menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => (open ? closeMenu() : openMenu())}
        className="focusable fixed left-4 top-4 z-[60] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line bg-white shadow-[0_10px_30px_-15px_rgba(23,23,22,0.35)] transition-colors duration-200 hover:bg-cyc"
      >
        <span className="relative block h-4 w-[18px]">
          <span
            className={`absolute left-0 top-0 h-[1.5px] w-full bg-flag transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? "top-1/2 -translate-y-1/2 rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-flag transition-opacity duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute bottom-0 left-0 h-[1.5px] w-full bg-flag transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? "bottom-1/2 translate-y-1/2 -rotate-45" : ""
            }`}
          />
        </span>
      </button>
    </>
  );
}
