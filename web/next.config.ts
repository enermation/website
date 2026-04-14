import type { NextConfig } from 'next'
import { withNextVideo } from 'next-video/process'

const nextConfig: NextConfig = {
  cacheComponents: true,
  allowedDevOrigins: ['192.168.0.95'],
  turbopack: {
    rules: {
      '*.webm': {
        loaders: ['next-video/webpack/video-raw-loader.js'],
        as: '*.json',
      },
    },
  },
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
