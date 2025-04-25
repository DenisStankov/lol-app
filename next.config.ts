/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ddragon.leagueoflegends.com",
      },
      {
        protocol: "https",
        hostname: "lol-app-green.vercel.app",
      },
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig
