import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.105",
    "http://192.168.1.105:3000",
    "http://192.168.1.105:3011",
  ],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
