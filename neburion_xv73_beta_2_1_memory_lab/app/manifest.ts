import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Neburion XV73",
    short_name: "Neburion",
    description: "Strukturiertes kognitives Training mit adaptiven Übungen und transparentem Lerncoach.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff7ef",
    theme_color: "#5a2418",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }
    ]
  };
}
