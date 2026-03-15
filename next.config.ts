import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Avatares do Google OAuth
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        // Assets do Cloudflare R2
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
  },
}

export default nextConfig
