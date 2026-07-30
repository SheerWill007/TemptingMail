/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  eslint: {
    // Don't run ESLint during production builds (only in dev)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on type errors (optional)
    ignoreBuildErrors: false,
  },
}

export default nextConfig
 