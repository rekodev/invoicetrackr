import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  experimental: {
    authInterrupts: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'asset.cloudinary.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: ''
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL}/api/:path*`
      }
    ];
  }
};

export default withNextIntl(nextConfig);
