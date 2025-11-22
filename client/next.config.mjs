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
        destination: `http://localhost:${process.env.SERVER_PORT}/api/:path*`
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Forwarded-For',
            value: ':x-forwarded-for'
          },
          {
            key: 'X-Real-IP',
            value: ':x-real-ip'
          }
        ]
      }
    ];
  }
};

export default withNextIntl(nextConfig);
