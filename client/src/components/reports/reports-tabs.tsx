import { buttonVariants } from '@heroui/react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { REPORT_PAGES } from '@/lib/constants/pages';

type Props = { active: (typeof REPORT_PAGES)[number]['key'] };

const ReportsTabs = async ({ active }: Props) => {
  const t = await getTranslations('header.user');
  const tTabs = await getTranslations('reports.tabs');

  return (
    <nav aria-label={tTabs('a11y_label')} className="flex gap-2">
      {REPORT_PAGES.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? 'page' : undefined}
          className={buttonVariants({
            variant: tab.key === active ? 'secondary' : 'ghost',
            size: 'sm'
          })}
        >
          {t(tab.key)}
        </Link>
      ))}
    </nav>
  );
};

export default ReportsTabs;
