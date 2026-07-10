import { SITE_URL as BASE_URL } from "@/lib/site";
import { landingPages, studios } from "@/lib/studios";


export default function sitemap() {
  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    ...landingPages.map((p) => ({
      url: `${BASE_URL}/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.9,
    })),
    ...studios.map((s) => ({
      url: `${BASE_URL}/studio/${s.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];
}
