import { studios } from "@/lib/studios";

const BASE_URL = "https://kader-rho.vercel.app";

export default function sitemap() {
  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/brand`, changeFrequency: "monthly", priority: 0.3 },
    ...studios.map((s) => ({
      url: `${BASE_URL}/studio/${s.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  ];
}
