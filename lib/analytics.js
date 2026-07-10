/* GA4-events — no-op zolang NEXT_PUBLIC_GA_ID niet is gezet (de layout
 * laadt gtag alleen mét ID). In development loggen we naar de console
 * zodat events zichtbaar zijn zonder GA.
 *
 * Event-catalogus (data die voor studio's interessant is):
 *   studio_open        pin/lijst/deeplink geopend → welke studio's trekken
 *   studio_detail_view detailpagina bekeken
 *   detail_click       kaart-detailkaart → detailpagina
 *   booking_click      klik naar Gearbooker — het conversiemoment
 *   show_on_map_click  detailpagina → kaart
 *   cluster_open       clusterlijst geopend (hoeveel, waar)
 *   filter_toggle      welke specs/typen mensen filteren
 *   place_search       waar mensen studio's zoeken (vraag-geografie)
 *   city_page_view     landingspagina bekeken (stad × type)
 */

export function track(event, params = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
  if (process.env.NODE_ENV === "development") {
    console.debug("[event]", event, params);
  }
}
