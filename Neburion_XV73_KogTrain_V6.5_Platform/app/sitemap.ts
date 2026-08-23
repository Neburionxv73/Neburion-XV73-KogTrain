import type { MetadataRoute } from "next";

const ROUTES = [
  "/",
  "/training/journey",
  "/training/focus",
  "/training/memory",
  "/training/attention",
  "/training/logic",
  "/training/language",
  "/training/visual",
  "/training/brain-fit",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const host = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
  if (!host) return [];

  const base = host.replace(/\/$/, "");
  return ROUTES.map((route) => ({
    url: `${base}${route}`,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/training/journey" ? 0.9 : 0.7,
  }));
}
