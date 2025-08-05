/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  typescript: {
    // Allow builds to continue with type errors during development
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
};

module.exports = nextConfig;
