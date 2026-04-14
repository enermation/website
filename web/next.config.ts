import type { NextConfig } from 'next'
import { withNextVideo } from 'next-video/process'

const nextConfig: NextConfig = {
  cacheComponents: true,
  allowedDevOrigins: ['192.168.0.95'],
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

export default withNextVideo(nextConfig)
