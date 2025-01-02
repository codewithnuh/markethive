import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    ppr: "incremental",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
