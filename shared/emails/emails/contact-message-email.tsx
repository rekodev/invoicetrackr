import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
  Tailwind
} from '@react-email/components';
import { render } from '@react-email/render';

interface ContactMessageEmailProps {
  email: string;
  message: string;
}

const ContactMessageEmail = ({ email, message }: ContactMessageEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>New contact message from {email}</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto max-w-[600px] overflow-hidden bg-white shadow-lg">
            <Section className="bg-white px-[32px] py-[24px]">
              <Text className="m-0 text-center text-[24px] font-bold text-[#7828C8]">
                InvoiceTrackr
              </Text>
              <Text className="m-0 mt-[4px] text-center text-[14px] text-[#481878]">
                New Contact Message
              </Text>
            </Section>

            <Section className="px-[32px] pb-[32px]">
              <Text className="mx-0 mb-[16px] mt-0 text-[20px] font-bold text-[#301050]">
                📧 New Contact Form Submission
              </Text>

              <Section className="mb-[24px] rounded-[8px] border border-[#E4D4F4] bg-[#F2EAFA] p-[20px]">
                <Text className="m-0 mb-[8px] text-[14px] font-semibold text-[#481878]">
                  From:
                </Text>
                <Text className="m-0 mb-[16px] text-[16px] font-medium text-[#6020A0]">
                  {email}
                </Text>

                <Hr className="my-[16px] border-[#E4D4F4]" />

                <Text className="m-0 mb-[8px] text-[14px] font-semibold text-[#481878]">
                  Message:
                </Text>
                <Text className="m-0 whitespace-pre-wrap text-[15px] leading-[24px] text-[#301050]">
                  {message}
                </Text>
              </Section>

              <Section className="rounded-md border-l-[4px] border-l-[#7828C8] bg-[#E4D4F4] p-[16px]">
                <Text className="m-0 text-[13px] text-[#481878]">
                  💡 <strong>Tip:</strong> Reply directly to {email} to respond
                  to this inquiry.
                </Text>
              </Section>
            </Section>

            <Section className="bg-[#F2EAFA] px-[32px] py-[24px]">
              <Text className="m-0 mb-[8px] text-center text-[12px] text-[#6020A0]">
                This email was sent from the{' '}
                <Link
                  href="https://invoicetrackr.app"
                  className="text-[#7828C8] no-underline hover:underline"
                >
                  InvoiceTrackr
                </Link>{' '}
                contact form
              </Text>
              <Text className="m-0 text-center text-[12px] text-[#6020A0]">
                © {new Date().getFullYear()} InvoiceTrackr. All rights
                reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ContactMessageEmail.PreviewProps = {
  email: 'john.doe@example.com',
  message:
    'Hi! I have a question about the premium features. Can you help me understand the differences between the free and paid plans?\n\nThanks!'
};

export default function renderContactMessageEmail(
  props: ContactMessageEmailProps
) {
  return render(<ContactMessageEmail {...props} />);
}
