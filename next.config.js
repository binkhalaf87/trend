/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Prisma يعمل فقط على server side — لا يُدرَج في client bundle
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
  // إخفاء TypeScript errors لا تمنع البناء على Vercel (optional)
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
