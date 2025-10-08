import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  },
  typescript: {
    // Игнорировать TypeScript ошибки во время билда
    ignoreBuildErrors: true,
  },
  eslint: {
    // Игнорировать ESLint ошибки во время билда
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
