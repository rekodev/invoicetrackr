import type { MetadataRoute } from 'next';

import {
  CLIENTS_PAGE,
  CONTRACTS_PAGE,
  DASHBOARD_PAGE,
  INVOICES_PAGE,
  ONBOARDING_PAGE,
  PROFILE_PAGE,
  VERIFY_EMAIL_PAGE
} from '@/lib/constants/pages';
import { appBaseUrl } from '@/lib/config/app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        CLIENTS_PAGE,
        CONTRACTS_PAGE,
        DASHBOARD_PAGE,
        `${INVOICES_PAGE}/`,
        ONBOARDING_PAGE,
        `${PROFILE_PAGE}/`,
        VERIFY_EMAIL_PAGE
      ]
    },
    sitemap: `${appBaseUrl}/sitemap.xml`
  };
}
