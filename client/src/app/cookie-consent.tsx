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
    <div className="fixed bottom-0 z-10 w-full">
      <div className="mx-auto max-w-7xl p-6">
        <Alert
          className="bg-default border-default-300 border"
          color="default"
          variant="solid"
          hideIcon
          isClosable
          isVisible={isVisible && cookieConsent === null}
          onClose={() => setIsVisible(false)}
        >
          <div className="flex flex-col gap-6 md:flex-row">
            <p className="text-sm">
              We use cookies to provide the best experience. By clicking “Accept
              All,” you agree to our use of cookies, including the analytics
              data described in our{' '}
              <Link
                className="text-secondary text-sm"
                href={PRIVACY_POLICY_PAGE}
              >
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="w-full md:max-w-max"
                color="secondary"
                variant="solid"
                onPress={handleAccept}
              >
                Accept All
              </Button>
              <Button
                className="w-full md:max-w-max"
                color="secondary"
                variant="bordered"
                onPress={handleDecline}
              >
                Decline
              </Button>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
}
