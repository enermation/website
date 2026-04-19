import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.95'],
  cacheComponents: true,
  transpilePackages: ['voyageai'],
  images: {
    loaderFile: './lib/image-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'behold.pictures',
      },
    ],
  },
}

export default nextConfig
