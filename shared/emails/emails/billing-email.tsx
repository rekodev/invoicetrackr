import * as React from 'react';
import { Section, Text } from 'react-email';

import {
  EmailButton,
  EmailFallbackLink,
  EmailLayout,
  EmailNotice,
  emailAppUrl
} from './email-components';

type Props = {
  subject: string;
  message: string;
  buttonText: string;
  fallbackLabel: string;
  note: string;
  billingUrl: string;
  footer: string;
  copyright: string;
};

const BillingEmail = ({
  subject,
  message,
  buttonText,
  fallbackLabel,
  note,
  billingUrl,
  footer,
  copyright
}: Props) => {
  return (
    <EmailLayout
      preview={subject}
      title={subject}
      footer={footer}
      copyright={copyright}
    >
      <Text className="mx-0 mb-[24px] mt-0 text-[15px] leading-[24px] text-[#34423C]">
        {message}
      </Text>

      <Section className="mb-[24px] text-center">
        <EmailButton href={billingUrl}>{buttonText}</EmailButton>
      </Section>

      <EmailFallbackLink
        label={fallbackLabel}
        href={billingUrl}
        className="mb-[20px]"
      />

      <EmailNotice>{note}</EmailNotice>
    </EmailLayout>
  );
};

BillingEmail.PreviewProps = {
  subject: 'Your InvoiceTrackr trial is ending soon',
  message:
    'Your 7-day trial is ending soon. Add a payment method in your account settings to keep using InvoiceTrackr.',
  buttonText: 'Manage billing',
  fallbackLabel: 'Or copy and paste this link:',
  note: 'Keeping your billing details current keeps your invoice workflow available without interruption.',
  billingUrl: `${emailAppUrl}/profile/billing`,
  footer: 'This email was sent by InvoiceTrackr',
  copyright: '© 2026 InvoiceTrackr. All rights reserved.'
};

export default BillingEmail;
