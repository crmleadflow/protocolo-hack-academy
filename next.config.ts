import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Desactivado a propósito: esta app es casi toda dinámica (sesión, Mongo)
  // y "Cache Components" obliga a envolver cada lectura en Suspense o a
  // marcarla con `"use cache"` — de más para un MVP que no necesita ese
  // nivel de cacheo todavía.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
