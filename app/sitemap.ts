import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://mdopeace.github.io/" },
    { url: "https://mdopeace.github.io/playground/" },
  ];
}
