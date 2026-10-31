/** @type {import('next').NextConfig} */
const nextConfig = { devIndicators: false, distDir: process.env.Q7_NEXT_DIST_DIR || ".next" };
export default nextConfig;
