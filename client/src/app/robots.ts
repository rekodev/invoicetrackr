import type { MetadataRoute } from 'next';

import { appBaseUrl } from '@/lib/config/app';
import {
  CLIENTS_PAGE,
  DASHBOARD_PAGE,
  EXPENSES_PAGE,
  INVOICES_PAGE,
  ONBOARDING_PAGE,
  PROFILE_PAGE,
  VERIFY_EMAIL_PAGE
} from '@/lib/constants/pages';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        CLIENTS_PAGE,
        DASHBOARD_PAGE,
        EXPENSES_PAGE,
        `${EXPENSES_PAGE}/`,
        `${INVOICES_PAGE}/`,
        ONBOARDING_PAGE,
        `${PROFILE_PAGE}/`,
        VERIFY_EMAIL_PAGE
      ]
    },
    sitemap: `${appBaseUrl}/sitemap.xml`
  };
}
