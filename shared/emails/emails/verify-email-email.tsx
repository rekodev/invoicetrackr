import * as React from 'react';
import { Section, Text } from 'react-email';

import {
  EmailButton,
  EmailFallbackLink,
  EmailLayout,
  EmailNotice,
  emailAppUrl
} from './email-components';

interface VerifyEmailEmailProps {
  verificationLink: string;
  translations: {
    subject: string;
    greeting: string;
    message: string;
    buttonText: string;
    orCopy: string;
    linkExpiry: string;
    noRequest: string;
    footer: string;
    copyright: string;
  };
}

const VerifyEmailEmail = ({
  verificationLink,
  translations
}: VerifyEmailEmailProps) => {
  return (
    <EmailLayout
      preview={translations.subject}
      title={translations.subject}
      footer={translations.footer}
      copyright={translations.copyright}
    >
      <Text className="mx-0 mb-[12px] mt-0 text-[20px] font-semibold leading-[26px] text-[#15181C]">
        {translations.greeting}
      </Text>

      <Text className="mx-0 mb-[24px] mt-0 text-[15px] leading-[24px] text-[#34423C]">
        {translations.message}
      </Text>

      <Section className="mb-[24px] text-center">
        <EmailButton href={verificationLink}>
          {translations.buttonText}
        </EmailButton>
      </Section>

      <EmailFallbackLink
        label={translations.orCopy}
        href={verificationLink}
        className="mb-[20px]"
      />

      <EmailNotice>{translations.linkExpiry}</EmailNotice>

      <Text className="mx-0 mb-0 mt-[16px] text-[13px] leading-[20px] text-[#6B7280]">
        {translations.noRequest}
      </Text>
    </EmailLayout>
  );
};

VerifyEmailEmail.PreviewProps = {
  verificationLink: `${emailAppUrl}/verify-email/abc123token456`,
  translations: {
    subject: 'Verify your InvoiceTrackr email',
    greeting: 'Welcome to InvoiceTrackr!',
    message:
      'Confirm your email address so you can send invoices and receive account notifications.',
    buttonText: 'Verify email',
    orCopy: 'Or copy and paste this link into your browser:',
    linkExpiry: 'This link will expire in 24 hours for security reasons.',
    noRequest:
      "If you didn't create an InvoiceTrackr account, you can safely ignore this email.",
    footer: 'This email was sent by InvoiceTrackr',
    copyright: '© 2026 InvoiceTrackr. All rights reserved.'
  }
};

export default VerifyEmailEmail;
