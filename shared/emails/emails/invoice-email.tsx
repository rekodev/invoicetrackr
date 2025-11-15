import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Tailwind
} from '@react-email/components';

interface InvoiceEmailProps {
  invoiceNumber?: string;
  amount?: string;
  dueDate?: string;
  senderName?: string;
  message?: string;
}

const InvoiceEmail = ({
  invoiceNumber = 'INV-2024-001',
  amount,
  dueDate,
  senderName = 'Your Service Provider',
  message = 'Please find your invoice attached.'
}: InvoiceEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`Invoice #${invoiceNumber} from ${senderName} - InvoiceTrackr`}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] overflow-hidden rounded-[8px] bg-white shadow-lg">
            {/* Header */}
            <Section className="bg-white px-[32px] py-[24px]">
              <Text className="m-0 text-center text-[24px] font-bold text-[#7828C8]">
                InvoiceTrackr
              </Text>
              <Text className="m-0 mt-[4px] text-center text-[14px] text-[#481878]">
                Professional Invoice Management
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-[32px] pb-[32px]">
              <Text className="mx-0 mb-[24px] mt-[24px] border border-red-500 text-[16px] leading-[24px] text-[#481878]">
                {message}
              </Text>

              {/* Invoice Details Card */}
              <Section className="mb-[24px] rounded-[8px] border border-[#E4D4F4] bg-[#F2EAFA] p-[24px]">
                <Text className="mb-[16px] mt-0 text-[18px] font-bold text-[#301050]">
                  Invoice Details
                </Text>

                <Section className="mb-[12px]">
                  <Text className="m-0 mb-[4px] text-[14px] font-semibold text-[#481878]">
                    Invoice Number:
                  </Text>
                  <Text className="m-0 text-[16px] font-bold text-[#6020A0]">
                    #{invoiceNumber}
                  </Text>
                </Section>

                {amount && (
                  <Section className="mb-[12px]">
                    <Text className="m-0 mb-[4px] text-[14px] font-semibold text-[#481878]">
                      Amount:
                    </Text>
                    <Text className="m-0 text-[20px] font-bold text-[#7828C8]">
                      {amount}
                    </Text>
                  </Section>
                )}

                {dueDate && (
                  <Section className="mb-[12px]">
                    <Text className="m-0 mb-[4px] text-[14px] font-semibold text-[#481878]">
                      Due Date:
                    </Text>
                    <Text className="m-0 text-[16px] font-medium text-[#6020A0]">
                      {dueDate}
                    </Text>
                  </Section>
                )}

                <Section>
                  <Text className="m-0 mb-[4px] text-[14px] font-semibold text-[#481878]">
                    From:
                  </Text>
                  <Text className="m-0 text-[16px] font-medium text-[#6020A0]">
                    {senderName}
                  </Text>
                </Section>
              </Section>

              {/* Attachment Notice */}
              <Section className="rounded-md border-l-[4px] border-l-[#7828C8] bg-[#E4D4F4] p-[16px]">
                <Text className="m-0 mb-[4px] text-[14px] font-semibold text-[#301050]">
                  📎 Invoice Attached
                </Text>
                <Text className="m-0 text-[14px] text-[#481878]">
                  The complete invoice document is attached to this email as a
                  PDF file.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="bg-[#F2EAFA] px-[32px] py-[24px]">
              <Text className="m-0 mb-[8px] text-center text-[12px] text-[#6020A0]">
                This email was sent by InvoiceTrackr
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

export default InvoiceEmail;
