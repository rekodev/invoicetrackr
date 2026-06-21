import * as React from 'react';
import { Text } from 'react-email';

import {
  EmailDetail,
  EmailDivider,
  EmailLayout,
  EmailNotice,
  EmailPanel
} from './email-components';

interface ContactMessageEmailProps {
  email: string;
  message: string;
}

const ContactMessageEmail = ({ email, message }: ContactMessageEmailProps) => {
  return (
    <EmailLayout
      preview={`New contact message from ${email}`}
      title="New contact message"
      subtitle="InvoiceTrackr support inbox"
      footer="This email was sent from the InvoiceTrackr contact form"
      copyright={`© ${new Date().getFullYear()} InvoiceTrackr. All rights reserved.`}
    >
      <EmailPanel className="mb-[20px]">
        <EmailDetail label="From">{email}</EmailDetail>

        <EmailDivider />

        <Text className="m-0 mb-[8px] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
          Message
        </Text>
        <Text className="m-0 whitespace-pre-wrap text-[15px] leading-[24px] text-[#15181C]">
          {message}
        </Text>
      </EmailPanel>

      <EmailNotice>
        Reply directly to {email} to respond to this inquiry.
      </EmailNotice>
    </EmailLayout>
  );
};

ContactMessageEmail.PreviewProps = {
  email: 'john.doe@example.com',
  message:
    'Hi! I have a question about the premium features. Can you help me understand the differences between the free and paid plans?\n\nThanks!'
};

export default ContactMessageEmail;
