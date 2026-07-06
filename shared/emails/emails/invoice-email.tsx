import * as React from 'react';
import { Section, Text } from 'react-email';

import {
  EmailButton,
  EmailDetail,
  EmailLayout,
  EmailNotice,
  EmailPanel,
  emailAppUrl
} from './email-components';

type Props = {
  invoiceNumber: string;
  amount?: string;
  dueDate?: string;
  senderName: string;
  message: string;
  publicInvoiceLink?: string;
  isSigningAvailable?: boolean;
  translations: {
    title: string;
    detailsTitle: string;
    sentBy: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    from: string;
    attachmentTitle: string;
    attachmentMessage: string;
    signingTitle: string;
    signingMessage: string;
    signingButton: string;
    publicInvoiceTitle: string;
    publicInvoiceMessage: string;
    publicInvoiceButton: string;
    footer: string;
    copyright: string;
  };
};

const InvoiceEmail = ({
  invoiceNumber,
  amount,
  dueDate,
  senderName,
  message,
  publicInvoiceLink,
  isSigningAvailable = true,
  translations
}: Props) => {
  const actionTitle = isSigningAvailable
    ? translations.signingTitle
    : translations.publicInvoiceTitle;
  const actionMessage = isSigningAvailable
    ? translations.signingMessage
    : translations.publicInvoiceMessage;
  const actionButton = isSigningAvailable
    ? translations.signingButton
    : translations.publicInvoiceButton;

  return (
    <EmailLayout
      preview={`${translations.invoiceNumber} #${invoiceNumber} ${translations.from} ${senderName} - ${translations.title}`}
      footer={translations.footer}
      copyright={`© ${new Date().getFullYear()} ${translations.copyright}`}
    >
      <Text className="mx-0 mb-[10px] mt-0 text-[15px] leading-[24px] text-[#34423C]">
        {message}
      </Text>

      <Text className="mx-0 mb-[22px] mt-0 text-[13px] leading-[20px] text-[#6B7280]">
        {translations.sentBy.replace('{senderName}', senderName)}
      </Text>

      <EmailPanel className="mb-[20px]">
        <Text className="mb-[18px] mt-0 text-[18px] font-semibold text-[#15181C]">
          {translations.detailsTitle}
        </Text>

        <EmailDetail label={translations.invoiceNumber}>
          #{invoiceNumber}
        </EmailDetail>

        {amount && (
          <EmailDetail label={translations.amount}>
            <span className="text-[#2BB673]">{amount}</span>
          </EmailDetail>
        )}

        {dueDate && (
          <EmailDetail label={translations.dueDate}>{dueDate}</EmailDetail>
        )}

        <EmailDetail label={translations.from}>{senderName}</EmailDetail>
      </EmailPanel>

      <EmailNotice title={translations.attachmentTitle}>
        {translations.attachmentMessage}
      </EmailNotice>

      {publicInvoiceLink && (
        <Section className="mt-[24px] text-center">
          <Text className="m-0 mb-[8px] text-[18px] font-semibold leading-[24px] text-[#15181C]">
            {actionTitle}
          </Text>
          <Text className="mx-0 mb-[18px] mt-0 text-[14px] leading-[22px] text-[#34423C]">
            {actionMessage}
          </Text>
          <EmailButton href={publicInvoiceLink}>{actionButton}</EmailButton>
        </Section>
      )}
    </EmailLayout>
  );
};

InvoiceEmail.PreviewProps = {
  invoiceNumber: 'SF-2026-0007',
  amount: '249.00 EUR',
  dueDate: '2026-07-03',
  senderName: 'Acme Studio',
  message: 'Please find your invoice attached.',
  publicInvoiceLink: `${emailAppUrl}/invoices/public/example-token`,
  isSigningAvailable: true,
  translations: {
    title: 'InvoiceTrackr',
    detailsTitle: 'Invoice Details',
    sentBy: 'This invoice was sent from {senderName} via InvoiceTrackr.',
    invoiceNumber: 'Invoice Number:',
    amount: 'Amount:',
    dueDate: 'Due Date:',
    from: 'From:',
    attachmentTitle: 'Invoice attached',
    attachmentMessage:
      'The complete invoice document is attached to this email as a PDF file.',
    signingTitle: 'Review and acknowledge invoice',
    signingMessage:
      'Open the invoice link to review the document, add a drawn acknowledgement, and download the PDF.',
    signingButton: 'Review and acknowledge',
    publicInvoiceTitle: 'View invoice',
    publicInvoiceMessage:
      'Open the secure invoice page to review the PDF and bank-transfer payment details.',
    publicInvoiceButton: 'View invoice',
    footer: 'This email was sent by InvoiceTrackr',
    copyright: 'InvoiceTrackr. All rights reserved.'
  }
};

export default InvoiceEmail;
