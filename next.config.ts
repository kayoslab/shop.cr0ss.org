import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://storage.googleapis.com/merchant-center-europe/sample-data/**')],
  },
};

export default nextConfig;
