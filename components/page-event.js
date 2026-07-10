"use client";

import { useEffect, useRef } from "react";

import { track } from "@/lib/analytics";

/* Vuurt één analytics-event bij het laden van een pagina — voor
 * server-gerenderde pagina's die event-parameters willen meesturen
 * (studio-id, stad, type) die een kale pageview niet heeft. */

export function PageEvent({ event, params }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, params);
  }, [event, params]);

  return null;
}
