import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Neburion XV73",
    short_name: "Neburion",
    description: "Strukturiertes kognitives Training mit adaptiven Übungen und transparentem Lerncoach.",
    id: "/",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#fff7ef",
    theme_color: "#5a2418",
    orientation: "any",
    categories: ["education", "health", "productivity"],
    lang: "de",
    dir: "ltr",
    shortcuts: [
      { name: "Training starten", short_name: "Training", url: "/session", icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "Fortschritt öffnen", short_name: "Fortschritt", url: "/progress", icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }] }
    ],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
