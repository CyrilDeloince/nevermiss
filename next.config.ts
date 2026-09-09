import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Évite les soucis Turbopack / binaire natif libsql sur Vercel
  serverExternalPackages: ["@libsql/client", "libsql"],
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
