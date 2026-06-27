'use client';

import { Alert, Button, CloseButton, Link } from '@heroui/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { PRIVACY_POLICY_PAGE } from '@/lib/constants/pages';
import { updateAnalyticsConsentAction } from '@/lib/actions/analytics';
import useCookieConsent from '@/lib/hooks/use-cookie-consent';

export default function CookieConsent() {
  const t = useTranslations('cookie_consent');
  const { cookieConsent, updateCookieConsent } = useCookieConsent();
  const [isVisible, setIsVisible] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const handleAccept = async () => {
    setIsPending(true);
    await updateAnalyticsConsentAction('accepted');
    updateCookieConsent('accepted');
    setIsVisible(false);
  };

  const handleDecline = async () => {
    setIsPending(true);
    await updateAnalyticsConsentAction('declined');
    updateCookieConsent('declined');
    setIsVisible(false);
  };

  if (!isVisible || cookieConsent !== null) return null;

  return (
    <div className="fixed bottom-0 z-10 w-full">
      <div className="mx-auto max-w-7xl p-6">
        <Alert status="default" className="border-default-300 relative border">
          <Alert.Content>
            <Alert.Description>
              <div className="flex flex-col gap-6 pr-8 md:flex-row md:items-center md:justify-between">
                <p className="text-sm">
                  {t('message')}{' '}
                  <Link
                    className="text-secondary text-sm"
                    href={PRIVACY_POLICY_PAGE}
                  >
                    {t('privacy_policy')}
                  </Link>
                  .
                </p>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <Button
                    className="w-full md:max-w-max"
                    isPending={isPending}
                    onPress={handleAccept}
                  >
                    {t('accept')}
                  </Button>

                  <Button
                    className="w-full border md:max-w-max"
                    isDisabled={isPending}
                    variant="outline"
                    onPress={handleDecline}
                  >
                    {t('decline')}
                  </Button>
                </div>
              </div>
            </Alert.Description>
          </Alert.Content>

          <CloseButton
            aria-label={t('a11y.close')}
            className="absolute right-3 top-3"
            onPress={() => setIsVisible(false)}
          />
        </Alert>
      </div>
    </div>
  );
}
