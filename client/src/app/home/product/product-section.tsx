import {
  ArrowDownTrayIcon,
  GlobeAltIcon,
  LinkIcon,
  ReceiptPercentIcon,
  ShieldCheckIcon,
  TableCellsIcon,
  UserGroupIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

import ClientsPagePreview from '../clients-page-preview';
import ExpensesPagePreview from '../expenses-page-preview';
import ExportsPreview from '../exports-preview';
import { InvoicesPagePreview } from '../invoices-page-preview';
import InvoicingPoints from '../invoicing-points';
import SectionHeading from '../section-heading';
import TaxReservePreview from '../tax-reserve-preview';
import Tile from '../tile/tile';
import TileBody from '../tile/tile-body';
import { IconComponent } from '../tile/types';

const featureTiles: Array<{
  key: 'clients' | 'expenses' | 'taxes' | 'reports';
  icon: IconComponent;
  preview: ReactNode;
}> = [
  { key: 'clients', icon: UserGroupIcon, preview: <ClientsPagePreview /> },
  {
    key: 'expenses',
    icon: ReceiptPercentIcon,
    preview: <ExpensesPagePreview />
  },
  { key: 'taxes', icon: WalletIcon, preview: <TaxReservePreview /> },
  { key: 'reports', icon: TableCellsIcon, preview: <ExportsPreview /> }
];

const capabilityTiles: Array<{
  key: 'links' | 'language' | 'data';
  icon: IconComponent;
}> = [
  { key: 'links', icon: LinkIcon },
  { key: 'language', icon: GlobeAltIcon },
  { key: 'data', icon: ShieldCheckIcon }
];

export default function ProductSection() {
  const t = useTranslations('home.product');

  return (
    <section
      id="features"
      className="mx-auto max-w-7xl scroll-mt-20 px-6 pb-16 pt-24"
    >
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        accent={t('title_accent')}
        body={t('subtitle')}
      />

      <div className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Tile reveal className="landing-scroll-reveal md:col-span-2">
          <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-center">
            <div>
              <TileBody
                eyebrow={t('items.invoices.eyebrow')}
                title={t('items.invoices.title')}
                body={t('items.invoices.body')}
              />
              <InvoicingPoints />
            </div>
            <InvoicesPagePreview />
          </div>
        </Tile>

        {featureTiles.map(({ key, icon, preview }) => (
          <Tile key={key} reveal className="landing-scroll-reveal">
            <TileBody
              icon={icon}
              title={t(`items.${key}.title`)}
              body={t(`items.${key}.body`)}
            />
            {preview}
          </Tile>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        {capabilityTiles.map(({ key, icon }) => (
          <Tile key={key} reveal className="landing-scroll-reveal">
            <TileBody
              icon={icon}
              title={t(`capabilities.${key}.title`)}
              body={t(`capabilities.${key}.body`)}
            />
            {key === 'language' && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {['EN', 'LT'].map((language) => (
                  <span
                    key={language}
                    className="bg-default-50 text-muted rounded-xl border px-2 py-1 text-[11px] font-medium"
                  >
                    {language}
                  </span>
                ))}
              </div>
            )}
            {key === 'data' && (
              <div className="bg-default-50 text-muted mt-5 inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-[11px]">
                <ArrowDownTrayIcon className="h-3 w-3" />
                {t('capabilities.data.file')}
              </div>
            )}
          </Tile>
        ))}
      </div>
    </section>
  );
}
