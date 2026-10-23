import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://plancheck.dev";
  const guides = [
    "rows-removed-by-filter",
    "sequential-scan",
    "row-estimate-mismatch",
    "nested-loop",
    "disk-sort",
  ];
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/analyze`, changeFrequency: "monthly", priority: 0.9 },
    ...guides.map((slug) => ({
      url: `${base}/postgresql-explain/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
