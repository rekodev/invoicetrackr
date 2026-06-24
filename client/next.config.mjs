import createNextIntlPlugin from 'next-intl/plugin';

import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const withNextIntl = createNextIntlPlugin();
const rootDirectory = dirname(dirname(fileURLToPath(import.meta.url)));

if (process.env.NODE_ENV === 'production') {
  const envPath = join(rootDirectory, '.env');

  if (existsSync(envPath)) process.loadEnvFile(envPath);
} else {
  const localEnvPath = join(rootDirectory, '.env.local');
  const envPath = join(rootDirectory, '.env');

  if (existsSync(localEnvPath)) process.loadEnvFile(localEnvPath);
  if (existsSync(envPath)) process.loadEnvFile(envPath);
}

const nextConfig = {
  transpilePackages: ['@invoicetrackr/types'],
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
        source: '/api/:path((?!auth(?:/|$)|webhook/stripe(?:/|$)).*)',
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
