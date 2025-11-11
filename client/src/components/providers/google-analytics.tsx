'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: any;
    dataLayer?: Object[];
  }
}

type Props = {
  gaId: string;
};

export default function GoogleAnalytics({ gaId }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams ? searchParams.toString() : '');

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', gaId, {
        page_path: url
      });
    }
  }, [pathname, searchParams, gaId]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('consent', 'default', {
              'analytics_storage': 'denied'
            });

            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `
        }}
      />
    </>
  );
}
