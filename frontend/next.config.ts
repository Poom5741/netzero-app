const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:8787";
import type { NextConfig } from "next";

// STATIC_EXPORT=1 produces a static `out/` directory for Cloudflare assets
// deploy; API calls go to NEXT_PUBLIC_API_BASE instead of the dev rewrite.
const isStaticExport = process.env.STATIC_EXPORT === "1";
// Dev-server rewrite target for the backend Worker. Override when the backend
// runs on a non-default port locally (e.g. BACKEND_ORIGIN=http://localhost:8799
// when :8787 is occupied); defaults preserve the historical :8787 contract.

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      // Build-time type/lint checks are covered by the repo gates (tsc + biome);
      // skipped here to fit the 2GB cgroup memory cap on the build machine.
      typescript: { ignoreBuildErrors: true },
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
        destination: BACKEND_ORIGIN + "/:path*",
      },
      {
        source: "/api/:path*",
        destination: BACKEND_ORIGIN + "/api/:path*",
      },
      {
        source: "/login",
        destination: BACKEND_ORIGIN + "/login",
      },
      {
        // POST target for the sponsor login form. Must NOT collide with the
        // /sponsor/login page route: Next applies array rewrites only after
        // page routes match, so a same-path rewrite is shadowed (SUB-F1).
        source: "/sponsor-login",
        destination: BACKEND_ORIGIN + "/sponsor/login",
      },
      {
        source: "/logout",
        destination: BACKEND_ORIGIN + "/logout",
      },
      {
        source: "/redirect",
        destination: BACKEND_ORIGIN + "/redirect",
      },
      {
        source: "/evidence/:path*",
        destination: BACKEND_ORIGIN + "/evidence/:path*",
      },
      {
        source: "/sponsor/:path*",
        destination: BACKEND_ORIGIN + "/sponsor/:path*",
      },
    ];
  },
}

export default nextConfig;
