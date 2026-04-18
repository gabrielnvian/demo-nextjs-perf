/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ Allowlist remote image hostnames so next/image can optimize them
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fakestoreapi.com",
        pathname: "/img/**",
      },
    ],
  },
};

module.exports = nextConfig;
