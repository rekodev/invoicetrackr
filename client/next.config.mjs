import { existsSync } from 'fs';
import createNextIntlPlugin from 'next-intl/plugin';
import { dirname, join } from 'path';
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
  output: 'standalone',
  outputFileTracingRoot: rootDirectory,
  transpilePackages: [
    '@invoicetrackr/types',
    '@invoicetrackr/pdf',
    '@react-pdf/renderer'
  ],
  experimental: {
    authInterrupts: true,
    serverActions: { bodySizeLimit: '11mb' },
    proxyClientMaxBodySize: '11mb'
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'"
          }
        ]
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path((?!auth(?:/|$)).*)',
        destination: `http://localhost:${process.env.SERVER_PORT}/api/:path*`
      }
    ];
  }
};

export default withNextIntl(nextConfig);
