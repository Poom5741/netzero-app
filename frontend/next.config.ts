import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @cloudflare/next-on-pages requires output: 'export' or 'standalone'
  // 'export' for fully static; switch to 'standalone' if adding API routes
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
