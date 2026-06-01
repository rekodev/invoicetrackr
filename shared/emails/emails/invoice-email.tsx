import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Tailwind
} from '@react-email/components';

interface InvoiceEmailProps {
  invoiceNumber: string;
  amount?: string;
  dueDate?: string;
  senderName: string;
  message: string;
  signingLink?: string;
  isSigningAvailable?: boolean;
  translations: {
    title: string;
    subtitle: string;
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
    signingFallback: string;
    viewTitle: string;
    viewMessage: string;
    viewButton: string;
    footer: string;
    copyright: string;
  };
}

const InvoiceEmail = ({
  invoiceNumber,
  amount,
  dueDate,
  senderName,
  message,
  signingLink,
  isSigningAvailable = true,
  translations
}: InvoiceEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>{`${translations.invoiceNumber} #${invoiceNumber} ${translations.from} ${senderName} - ${translations.title}`}</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto max-w-[600px] overflow-hidden bg-white shadow-lg">
            <Section className="bg-white px-[32px] py-[24px]">
              <Text className="m-0 text-center text-[24px] font-bold text-[#7828C8]">
                {translations.title}
              </Text>
              <Text className="m-0 mt-[4px] text-center text-[14px] text-[#481878]">
                {translations.subtitle}
              </Text>
            </Section>

            <Section className="px-[32px] pb-[32px]">
              <Text className="mx-0 mb-[24px] mt-[24px] text-[16px] leading-[24px] text-[#481878]">
                {message}
              </Text>

              <Section className="mb-[20px] rounded-[8px] border border-[#E4D4F4] bg-white p-[18px]">
                <Text className="m-0 text-[14px] leading-[20px] text-[#481878]">
                  {translations.sentBy.replace('{senderName}', senderName)}
                </Text>
              </Section>

              <Section className="mb-[24px] rounded-[8px] border border-[#E4D4F4] bg-[#F2EAFA] p-[24px]">
                <Text className="mb-[16px] mt-0 text-[18px] font-bold text-[#301050]">
                  {translations.detailsTitle}
                </Text>

                <Section className="mb-[12px]">
                  <Text className="m-0 mb-[4px] text-[14px] font-semibold text-[#481878]">
                    {translations.invoiceNumber}
                  </Text>
                  <Text className="m-0 text-[16px] font-bold text-[#6020A0]">
                    #{invoiceNumber}
                  </Text>
                </Section>

                {amount && (
                  <Section className="mb-[12px]">
                    <Text className="m-0 mb-[4px] text-[14px] font-semibold text-[#481878]">
                      {translations.amount}
                    </Text>
                    <Text className="m-0 text-[20px] font-bold text-[#7828C8]">
                      {amount}
                    </Text>
                  </Section>
                )}

                {dueDate && (
                  <Section className="mb-[12px]">
                    <Text className="m-0 mb-[4px] text-[14px] font-semibold text-[#481878]">
                      {translations.dueDate}
                    </Text>
                    <Text className="m-0 text-[16px] font-medium text-[#6020A0]">
                      {dueDate}
                    </Text>
                  </Section>
                )}

                <Section>
                  <Text className="m-0 mb-[4px] text-[14px] font-semibold text-[#481878]">
                    {translations.from}
                  </Text>
                  <Text className="m-0 text-[16px] font-medium text-[#6020A0]">
                    {senderName}
                  </Text>
                </Section>
              </Section>

              <Section className="rounded-md border-l-[4px] border-l-[#7828C8] bg-[#E4D4F4] p-[16px]">
                <Text className="m-0 mb-[4px] text-[14px] font-semibold text-[#301050]">
                  📎 {translations.attachmentTitle}
                </Text>
                <Text className="m-0 text-[14px] text-[#481878]">
                  {translations.attachmentMessage}
                </Text>
              </Section>

              {signingLink && (
                <Section className="mt-[16px] rounded-[8px] border border-[#E4D4F4] bg-white p-[20px] text-center">
                  <Text className="m-0 mb-[8px] text-[16px] font-bold text-[#301050]">
                    {isSigningAvailable
                      ? translations.signingTitle
                      : translations.viewTitle}
                  </Text>
                  <Text className="mx-0 mb-[18px] mt-0 text-[14px] leading-[20px] text-[#481878]">
                    {isSigningAvailable
                      ? translations.signingMessage
                      : translations.viewMessage}
                  </Text>
                  <Link
                    href={signingLink}
                    className="inline-block rounded-[8px] bg-[#7828C8] px-[18px] py-[12px] text-[14px] font-semibold text-white no-underline"
                  >
                    {isSigningAvailable
                      ? translations.signingButton
                      : translations.viewButton}
                  </Link>
                  <Text className="mx-0 mb-0 mt-[16px] text-left text-[12px] leading-[18px] text-[#6020A0]">
                    {translations.signingFallback}
                  </Text>
                  <Link
                    href={signingLink}
                    className="break-all text-[12px] text-[#7828C8]"
                  >
                    {signingLink}
                  </Link>
                </Section>
              )}
            </Section>

            <Section className="bg-[#F2EAFA] px-[32px] py-[24px]">
              <Text className="m-0 mb-[8px] text-center text-[12px] text-[#6020A0]">
                {translations.footer.split('InvoiceTrackr')[0]}
                <Link
                  href="https://invoicetrackr.app"
                  className="text-[#7828C8] no-underline hover:underline"
                >
                  InvoiceTrackr
                </Link>
                {translations.footer.split('InvoiceTrackr')[1] || ''}
              </Text>
              <Text className="m-0 text-center text-[12px] text-[#6020A0]">
                © {new Date().getFullYear()} {translations.copyright}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default InvoiceEmail;
