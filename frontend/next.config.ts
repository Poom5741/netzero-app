import type { NextConfig } from "next";

// STATIC_EXPORT=1 produces a static `out/` directory for Cloudflare assets
// deploy; API calls go to NEXT_PUBLIC_API_BASE instead of the dev rewrite.
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = isStaticExport
  ? { output: "export" }
  : {
      async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:8787/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:8787/api/:path*",
      },
    ];
  },
}

export default nextConfig;
