import { Accordion } from '@heroui/react';
import { useTranslations } from 'next-intl';

import SectionHeading from './section-heading';

const FAQ_ITEMS = ['free', 'export', 'payments', 'languages'] as const;

export default function FAQ() {
  const t = useTranslations('home.faq');

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />
      <Accordion hideSeparator className="mt-12 border-y">
        {FAQ_ITEMS.map((key) => (
          <Accordion.Item
            key={key}
            id={key}
            className="border-b last:border-b-0"
          >
            <Accordion.Heading>
              <Accordion.Trigger className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-medium">
                {t(`items.${key}.question`)}
                <Accordion.Indicator className="text-muted h-4 w-4 shrink-0" />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body className="text-muted pb-5 text-sm leading-relaxed">
                {t(`items.${key}.answer`)}
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </section>
  );
}
