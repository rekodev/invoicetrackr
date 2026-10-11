import { getTranslations } from 'next-intl/server';

import InfoPopover from '@/components/ui/info-popover';
import { JOURNAL_GUIDE_ITEMS } from '@/lib/constants/journal';

const JournalGuide = async () => {
  const t = await getTranslations('reports.journal.guide');

  return (
    <InfoPopover title={t('title')}>
      <p className="text-muted">{t('subtitle')}</p>
      <ul className="text-muted list-disc space-y-2 pl-5">
        {JOURNAL_GUIDE_ITEMS.map((item) => (
          <li key={item}>{t(`items.${item}`)}</li>
        ))}
      </ul>
    </InfoPopover>
  );
};

export default JournalGuide;
