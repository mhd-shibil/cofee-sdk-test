import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow devices on the local network (e.g. iPad on the same Wi-Fi) to load dev assets
  allowedDevOrigins: ["192.168.201.120"],
};

export default nextConfig;
