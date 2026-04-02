import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyTimeout: 600_000, // 10 minutes for long AI agent chains
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://localhost:8001/api/:path*",
      },
      {
        source: "/images/:path*",
        destination: "http://localhost:8001/images/:path*",
      },
      {
        source: "/videos/:path*",
        destination: "http://localhost:8001/videos/:path*",
      },
    ];
  },
};

export default nextConfig;
