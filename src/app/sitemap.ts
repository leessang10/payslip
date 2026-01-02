import type { MetadataRoute } from "next";

const siteUrl = "https://payslip-green.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
  ];
}
