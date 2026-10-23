import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PlanCheck — PostgreSQL EXPLAIN Analyzer",
    short_name: "PlanCheck",
    description: "Evidence-based PostgreSQL EXPLAIN analysis.",
    start_url: "/",
    display: "standalone",
    background_color: "#071015",
    theme_color: "#071015",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
