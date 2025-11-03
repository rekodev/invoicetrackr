'use client';

import { Alert, Button, Link } from '@heroui/react';
import { useState } from 'react';

import { CookieConsentStatus } from '@/lib/types';
import { PRIVACY_POLICY_PAGE } from '@/lib/constants/pages';
import useCookieConsent from '@/lib/hooks/use-cookie-consent';

export default function CookieConsent() {
  const { cookieConsent, updateCookieConsent } = useCookieConsent();
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = () => {
    updateCookieConsent(CookieConsentStatus.Accepted);
    setIsVisible(false);
  };

  const handleDecline = () => {
    updateCookieConsent(CookieConsentStatus.Declined);
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-0 flex w-full items-center justify-center p-6">
      <Alert
        className="bg-default border-default-300 max-w-7xl items-center border"
        color="default"
        variant="solid"
        hideIcon
        description={
          <div>
            We use cookies to provide the best experience. By clicking “Accept
            All,” you agree to our use of cookies, including the analytics data
            described in our{' '}
            <Link className="text-secondary text-sm" href={PRIVACY_POLICY_PAGE}>
              Privacy Policy
            </Link>
            .
          </div>
        }
        isVisible={isVisible && cookieConsent === null}
        onClose={() => setIsVisible(false)}
        endContent={
          <div className="flex gap-2">
            <Button color="secondary" variant="solid" onPress={handleAccept}>
              Accept All
            </Button>
            <Button
              color="secondary"
              variant="bordered"
              onPress={handleDecline}
            >
              Decline
            </Button>
          </div>
        }
      />
    </div>
  );
}
