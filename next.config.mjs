/** @type {import('next').NextConfig} */
const nextConfig = {
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
