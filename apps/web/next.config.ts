import type { NextConfig } from "next";

const backend = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
const nextConfig: NextConfig = {
  output: "standalone",
  // Allows verification builds to use an isolated output directory while next dev is active.
  distDir: process.env.ARGUS_NEXT_DIST_DIR ?? ".next",
  transpilePackages: ["three"],
  turbopack: { root: process.cwd() },
  async rewrites() {
    // Vercel's project-level services routing sends /api/* to FastAPI.
    // Keep this proxy for local development and Docker only.
    if (process.env.VERCEL) return [];
    return [{ source: "/api/:path*", destination: `${backend}/:path*` }];
  },
};

export default nextConfig;
