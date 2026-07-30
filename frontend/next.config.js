/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  eslint: {
    // Only run ESLint on these directories during build
    dirs: ['app', 'components', 'lib'],
    // Don't fail the build on ESLint errors
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Don't fail build on type errors (optional)
    ignoreBuildErrors: false,
  },
}

export default nextConfig
 