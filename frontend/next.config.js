/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
	  {
        protocol: 'http',
        hostname: 'backend',   // For the Docker internal server fetch
        port: '8000',
      },
    ],
  },
};

export default nextConfig;