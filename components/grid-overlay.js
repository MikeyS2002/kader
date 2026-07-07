"use client";

import { useEffect, useState } from "react";

/* Grid overlay — dev-hulpmiddel.
 *
 * ⌘G (of Ctrl+G) toggle't een kolommen-overlay over de pagina:
 * 4 kolommen mobiel, 12 vanaf md. Zelfde container als de pagina
 * (max-w 1440px, px-6 sm:px-10).
 */

export function GridOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        !e.shiftKey &&
        !e.altKey &&
        e.key.toLowerCase() === "g"
      ) {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!visible) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
      <div className="mx-auto grid h-full w-full max-w-[1440px] grid-cols-4 gap-4 px-6 sm:px-10 md:grid-cols-12">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={
              i >= 4
                ? "hidden border-x border-gel/20 bg-gel/10 md:block"
                : "border-x border-gel/20 bg-gel/10"
            }
          />
        ))}
      </div>
      <div className="fixed bottom-4 left-4 rounded-md bg-flag px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] text-cyc uppercase">
        grid · ⌘G
      </div>
    </div>
  );
}
