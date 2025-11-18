import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Link,
  Tailwind
} from '@react-email/components';
import { render } from '@react-email/render';

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
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>{translations.subject}</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto max-w-[600px] overflow-hidden bg-white shadow-lg">
            <Section className="bg-white px-[32px] py-[24px]">
              <Text className="m-0 text-center text-[24px] font-bold text-[#7828C8]">
                InvoiceTrackr
              </Text>
              <Text className="m-0 mt-[4px] text-center text-[14px] text-[#481878]">
                {translations.subject}
              </Text>
            </Section>

            <Section className="px-[32px] pb-[32px]">
              <Text className="mx-0 mb-[16px] mt-0 text-[20px] font-bold text-[#301050]">
                {translations.greeting}
              </Text>

              <Text className="mx-0 mb-[24px] mt-0 text-[16px] leading-[24px] text-[#481878]">
                {translations.message}
              </Text>

              <Section className="mb-[24px] text-center">
                <Button
                  href={resetLink}
                  className="inline-block rounded-[8px] bg-[#7828C8] px-[32px] py-[14px] text-[16px] font-semibold text-white no-underline"
                >
                  {translations.buttonText}
                </Button>
              </Section>

              <Text className="mx-0 mb-[16px] mt-0 text-center text-[14px] text-[#6020A0]">
                {translations.orCopy}
              </Text>

              <Section className="mb-[24px] rounded-[8px] border border-[#E4D4F4] bg-[#F2EAFA] p-[16px]">
                <Text className="m-0 break-all text-[12px] text-[#481878]">
                  {resetLink}
                </Text>
              </Section>

              <Hr className="my-[24px] border-[#E4D4F4]" />

              <Text className="mx-0 mb-[16px] mt-0 text-[14px] leading-[20px] text-[#6020A0]">
                {translations.linkExpiry}
              </Text>

              <Text className="mx-0 mb-0 mt-0 text-[14px] leading-[20px] text-[#6020A0]">
                {translations.noRequest}
              </Text>
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
                {translations.copyright}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ResetPasswordEmail.PreviewProps = {
  resetLink: 'https://invoicetrackr.app/create-new-password/abc123token456',
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
    copyright: '© 2025 InvoiceTrackr. All rights reserved.'
  }
};

export default function renderResetPasswordEmail(
  props: ResetPasswordEmailProps
) {
  return render(<ResetPasswordEmail {...props} />);
}
