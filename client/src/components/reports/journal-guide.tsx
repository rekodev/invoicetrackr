import { Card } from '@heroui/react';
import { getTranslations } from 'next-intl/server';

import { JOURNAL_GUIDE_ITEMS } from '@/lib/constants/journal';

const JournalGuide = async () => {
  const t = await getTranslations('reports.journal.guide');

  return (
    <Card className="border">
      <Card.Header className="flex-row flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-medium">{t('title')}</h2>
          <p className="text-muted text-sm">{t('subtitle')}</p>
        </div>
      </Card.Header>
      <Card.Content>
        <ul className="text-muted list-disc space-y-2 pl-5 text-sm">
          {JOURNAL_GUIDE_ITEMS.map((item) => (
            <li key={item}>{t(`items.${item}`)}</li>
          ))}
        </ul>
      </Card.Content>
    </Card>
  );
};

export default JournalGuide;
