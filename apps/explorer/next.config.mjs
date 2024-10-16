/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'placehold.co',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'ipfs.io',
            port: '',
            pathname: '/**',
          },
        ],
      },
};

export default nextConfig;
