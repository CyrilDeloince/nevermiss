import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Évite les soucis Turbopack / binaire natif libsql sur Vercel
  serverExternalPackages: ["@libsql/client", "libsql"],
};

export default nextConfig;
