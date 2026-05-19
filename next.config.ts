import type { NextConfig } from "next";



const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co", // Allows any Supabase subdomain
      },
      // Add other domains like 'res.cloudinary.com' if needed
    ],
  },
  // ... other existing configuration
};


export default nextConfig;
