import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2emnz1krfjsht.cloudfront.net',
      },
    ],
  },
};

export default nextConfig;
