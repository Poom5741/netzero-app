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
        source: "/api/:path*",
        destination: "http://localhost:8787/api/:path*",
      },
      {
        source: "/login",
        destination: "http://localhost:8787/login",
      },
      {
        source: "/logout",
        destination: "http://localhost:8787/logout",
      },
      {
        source: "/me",
        destination: "http://localhost:8787/me",
      },
    ];
  },
}

export default nextConfig;
