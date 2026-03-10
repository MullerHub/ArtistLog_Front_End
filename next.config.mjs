/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  images: {
    unoptimized: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  turbopack: {},
}

export default nextConfig
