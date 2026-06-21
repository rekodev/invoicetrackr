import * as React from 'react';
import { Section, Text } from '@react-email/components';

import {
  EmailButton,
  EmailFallbackLink,
  EmailLayout,
  EmailNotice,
  emailAppUrl
} from './email-components';

interface ResetPasswordEmailProps {
  resetLink: string;
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

const ResetPasswordEmail = ({
  resetLink,
  translations
}: ResetPasswordEmailProps) => {
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
        <EmailButton href={resetLink}>{translations.buttonText}</EmailButton>
      </Section>

      <EmailFallbackLink
        label={translations.orCopy}
        href={resetLink}
        className="mb-[20px]"
      />

      <EmailNotice>{translations.linkExpiry}</EmailNotice>

      <Text className="mx-0 mb-0 mt-[16px] text-[13px] leading-[20px] text-[#6B7280]">
        {translations.noRequest}
      </Text>
    </EmailLayout>
  );
};

ResetPasswordEmail.PreviewProps = {
  resetLink: `${emailAppUrl}/create-new-password/abc123token456`,
  translations: {
    subject: 'Reset Your Password',
    greeting: 'Hello!',
    message:
      'We received a request to reset your password. Click the button below to create a new password:',
    buttonText: 'Reset Password',
    orCopy: 'Or copy and paste this link into your browser:',
    linkExpiry: 'This link will expire in 1 hour for security reasons.',
    noRequest:
      "If you didn't request a password reset, you can safely ignore this email.",
    footer: 'This email was sent by InvoiceTrackr',
    copyright: '© 2026 InvoiceTrackr. All rights reserved.'
  }
};

export default ResetPasswordEmail;
