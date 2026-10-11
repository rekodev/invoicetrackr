import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { ButtonGroup,buttonVariants } from '@heroui/react';
import { getTranslations } from 'next-intl/server';

import InfoPopover from '@/components/ui/info-popover';
import { ANNUAL_PACKAGE_SHEETS } from '@/lib/constants/annual-package';
import { annualPackageExportHref } from '@/lib/utils/annual-package';

type Props = { year: number };

const AnnualPackageDownload = async ({ year }: Props) => {
  const t = await getTranslations('reports.annual.contents');

  return (
    <ButtonGroup size="sm">
      <a
        href={annualPackageExportHref(year)}
        className={buttonVariants({ size: 'sm' })}
      >
        <ArrowDownTrayIcon className="size-4" />
        {t('download')}
      </a>
      <InfoPopover
        title={t('info_title')}
        placement="bottom end"
        buttonVariant="primary"
        buttonPrefix={<ButtonGroup.Separator className="opacity-40" />}
      >
        <ul className="list-disc space-y-2 pl-5">
          {ANNUAL_PACKAGE_SHEETS.map((sheet) => (
            <li key={sheet}>
              <p className="font-medium">{t(`sheets.${sheet}.name`)}</p>
              <p className="text-muted">{t(`sheets.${sheet}.description`)}</p>
            </li>
          ))}
        </ul>
        <p className="text-muted">{t('disclaimer')}</p>
      </InfoPopover>
    </ButtonGroup>
  );
};

export default AnnualPackageDownload;
