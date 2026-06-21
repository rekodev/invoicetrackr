import * as React from 'react';
import type { ReactNode } from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text
} from 'react-email';

const runtimeEnv = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env;

export const emailAppUrl = (
  runtimeEnv?.APP_BASE_URL ||
  runtimeEnv?.NEXT_PUBLIC_BASE_URL ||
  'http://localhost:3000'
).replace(/\/+$/, '');

type EmailLayoutProps = {
  preview: string;
  title?: string;
  subtitle?: string;
  footer: string;
  copyright: string;
  children: ReactNode;
};

type EmailButtonProps = {
  href: string;
  children: ReactNode;
};

type EmailPanelProps = {
  children: ReactNode;
  className?: string;
};

type EmailNoticeProps = {
  title?: string;
  children: ReactNode;
};

type EmailDetailProps = {
  label: string;
  children: ReactNode;
};

const renderFooterText = (footer: string) => {
  const [before, after] = footer.split('InvoiceTrackr');

  return (
    <>
      {before}
      <Link
        href={emailAppUrl}
        className="font-semibold text-[#2BB673] no-underline"
      >
        InvoiceTrackr
      </Link>
      {after || ''}
    </>
  );
};

export function EmailLayout({
  preview,
  title,
  subtitle,
  footer,
  copyright,
  children
}: EmailLayoutProps) {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>{preview}</Preview>
        <Body className="m-0 bg-[#0C0E10] font-sans">
          <Container className="mx-auto max-w-[600px] overflow-hidden bg-[#FFFFFF]">
            <Section className="border-b border-[#E5E7EB] bg-[#111418] px-[32px] py-[28px]">
              <Text className="m-0 text-center text-[18px] font-bold tracking-normal text-[#ECEDEE]">
                INVOICE
                <span className="text-[#3DDC97]">TRACKR</span>
              </Text>

              {title && (
                <Text className="m-0 mt-[18px] text-center text-[24px] font-semibold leading-[30px] text-[#FFFFFF]">
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text className="m-0 mt-[6px] text-center text-[14px] leading-[20px] text-[#9BA1A6]">
                  {subtitle}
                </Text>
              )}
            </Section>

            <Section className="px-[32px] py-[32px]">{children}</Section>

            <Section className="border-t border-[#E5E7EB] bg-[#F7F8F8] px-[32px] py-[24px]">
              <Text className="m-0 mb-[8px] text-center text-[12px] leading-[18px] text-[#6B7280]">
                {renderFooterText(footer)}
              </Text>
              <Text className="m-0 text-center text-[12px] leading-[18px] text-[#6B7280]">
                {copyright}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button
      href={href}
      className="inline-block rounded-[8px] bg-[#2BB673] px-[24px] py-[12px] text-[14px] font-semibold text-white no-underline"
    >
      {children}
    </Button>
  );
}

export function EmailPanel({ children, className }: EmailPanelProps) {
  return (
    <Section
      className={`rounded-[10px] border border-[#DCE2E0] bg-[#F7FAF8] p-[20px] ${className || ''}`}
    >
      {children}
    </Section>
  );
}

export function EmailNotice({ title, children }: EmailNoticeProps) {
  return (
    <Section className="rounded-[8px] border-l-[4px] border-l-[#3DDC97] bg-[#EEFDF6] p-[16px]">
      {title && (
        <Text className="m-0 mb-[4px] text-[14px] font-semibold text-[#15181C]">
          {title}
        </Text>
      )}
      <Text className="m-0 text-[14px] leading-[20px] text-[#34423C]">
        {children}
      </Text>
    </Section>
  );
}

export function EmailDetail({ label, children }: EmailDetailProps) {
  return (
    <Section className="mb-[12px]">
      <Text className="m-0 mb-[4px] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
        {label}
      </Text>
      <Text className="m-0 text-[16px] font-semibold text-[#15181C]">
        {children}
      </Text>
    </Section>
  );
}

export function EmailFallbackLink({
  label,
  href,
  className
}: {
  label: string;
  href: string;
  className?: string;
}) {
  return (
    <Section className={className || ''}>
      <Text className="mx-0 mb-[10px] mt-[16px] text-[12px] leading-[18px] text-[#6B7280]">
        {label}
      </Text>
      <Section className="rounded-[8px] border border-[#DCE2E0] bg-[#F7F8F8] p-[14px]">
        <Link href={href} className="break-all text-[12px] text-[#2BB673]">
          {href}
        </Link>
      </Section>
    </Section>
  );
}

export function EmailDivider() {
  return <Hr className="my-[24px] border-[#DCE2E0]" />;
}
