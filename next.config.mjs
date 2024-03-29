/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
    // domains: [
    //     "utfs.io"
    // ]
  },
};

export default nextConfig;
