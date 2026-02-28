/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  webpack: (config, { client }) => {
    if (client) {
      config.infrastructureLogging = {
        debug: [],
        log: [],
        info: [],
        warn: [],
      }
    }
    return config
  },
  turbopack: {},
}

export default nextConfig
