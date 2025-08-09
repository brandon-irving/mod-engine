/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure static export for GitHub Pages embedding
  output: "export",
  trailingSlash: true,
  // Serve under Docusaurus baseUrl (/mod-engine) + demo path
  basePath: isProd ? "/mod-engine/demo" : "",
  images: { unoptimized: true },

  typescript: {
    // Allow builds to continue with type errors during development
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
};

module.exports = nextConfig;
