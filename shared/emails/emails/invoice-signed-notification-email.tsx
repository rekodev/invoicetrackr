import * as React from 'react';
import { Section, Text } from '@react-email/components';

import {
  EmailButton,
  EmailFallbackLink,
  EmailLayout,
  EmailNotice,
  EmailPanel,
  emailAppUrl
} from './email-components';

type Props = {
  subject: string;
  message: string;
  reviewMessage: string;
  buttonText: string;
  invoiceUrl: string;
  footer: string;
  copyright: string;
};

const InvoiceSignedNotificationEmail = ({
  subject,
  message,
  reviewMessage,
  buttonText,
  invoiceUrl,
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
      <EmailPanel className="mb-[20px]">
        <Text className="m-0 text-[15px] leading-[24px] text-[#15181C]">
          {message}
        </Text>
      </EmailPanel>

      <EmailNotice>{reviewMessage}</EmailNotice>

      <Section className="mt-[24px] text-center">
        <EmailButton href={invoiceUrl}>{buttonText}</EmailButton>
      </Section>

      <EmailFallbackLink label={reviewMessage} href={invoiceUrl} />
    </EmailLayout>
  );
};

InvoiceSignedNotificationEmail.PreviewProps = {
  subject: 'Invoice INV-001 was signed',
  message: 'Acme Studio signed invoice INV-001.',
  reviewMessage: 'You can review the signed invoice here:',
  buttonText: 'View signed invoice',
  invoiceUrl: `${emailAppUrl}/invoices/public/example-token`,
  footer: 'This email was sent by InvoiceTrackr',
  copyright: '© 2026 InvoiceTrackr. All rights reserved.'
};

export default InvoiceSignedNotificationEmail;
