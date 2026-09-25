import type { NextConfig } from "next";

// STATIC_EXPORT=1 produces a static `out/` directory for Cloudflare assets
// deploy; API calls go to NEXT_PUBLIC_API_BASE instead of the dev rewrite.
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      // Build-time type/lint checks are covered by the repo gates (tsc + biome);
      // skipped here to fit the 2GB cgroup memory cap on the build machine.
      typescript: { ignoreBuildErrors: true },
      eslint: { ignoreDuringBuilds: true },
      // The build shares a 2GB cgroup with the desktop browser; disable the
      // memory-heavy build phases and run a single compile worker.
      experimental: { cpus: 1, webpackMemoryOptimizations: true },
      webpack: (c) => {
        c.optimization.minimize = false;
        c.cache = false;
        return c;
      },
    }
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
      {
        source: "/login",
        destination: "http://localhost:8787/login",
      },
      {
        source: "/logout",
        destination: "http://localhost:8787/logout",
      },
      {
        source: "/redirect",
        destination: "http://localhost:8787/redirect",
      },
      {
        source: "/evidence/:path*",
        destination: "http://localhost:8787/evidence/:path*",
      },
      {
        source: "/sponsor/:path*",
        destination: "http://localhost:8787/sponsor/:path*",
      },
    ];
  },
}

export default nextConfig;
