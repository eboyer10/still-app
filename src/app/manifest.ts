import type { MetadataRoute } from "next";

/** Lets phones add Still to the home screen. No service worker, no offline caching, no notifications. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Still",
    short_name: "Still",
    description: "A quiet moment to pause, reconnect, and take one meaningful step.",
    start_url: "/",
    display: "standalone",
    background_color: "#1a2670",
    theme_color: "#2a2a8c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
