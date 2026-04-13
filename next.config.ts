import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vl.imgix.net",
      },
      {
        protocol: "https",
        hostname: "cdn.imagin.studio",
      },
    ],
  },
};

export default nextConfig;
