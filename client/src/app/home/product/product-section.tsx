import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  CreditCardIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  LinkIcon,
  PencilSquareIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import CompactDashboardPreview from '../compact-dashboard-preview';
import { useTranslations } from 'next-intl';

import ClientsPagePreview from '../clients-page-preview';
import ContractsSoonPreview from '../contracts-soon-preview';
import { IconComponent } from '../tile/types';
import { InvoicesPagePreview } from '../invoices-page-preview';
import SectionHeading from '../section-heading';
import Tile from '../tile/tile';
import TileBody from '../tile/tile-body';

const productTiles: Array<{
  key: 'invoices' | 'dashboard' | 'clients' | 'contracts';
  icon?: IconComponent;
  className?: string;
}> = [
  { key: 'invoices', className: 'md:col-span-6' },
  { key: 'dashboard', icon: ChartBarIcon, className: 'md:col-span-6' },
  { key: 'clients', icon: UserGroupIcon, className: 'md:col-span-3' },
  { key: 'contracts', icon: PencilSquareIcon, className: 'md:col-span-3' }
];

const capabilityTiles: Array<{
  key: 'payments' | 'links' | 'email' | 'language' | 'export';
  icon: IconComponent;
  className?: string;
}> = [
  { key: 'payments', icon: CreditCardIcon },
  { key: 'links', icon: LinkIcon },
  { key: 'email', icon: EnvelopeIcon },
  { key: 'language', icon: GlobeAltIcon },
  { key: 'export', icon: ArrowDownTrayIcon }
];

export default function ProductSection() {
  const t = useTranslations('home.product');

  return (
    <section id="features" className="mx-auto max-w-7xl px-6 pb-16 pt-24">
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        accent={t('title_accent')}
        body={t('subtitle')}
      />

      <div className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-6">
        {productTiles.map(({ key, icon, className }) => (
          <Tile key={key} className={className}>
            <TileBody
              icon={icon}
              eyebrow={
                key === 'invoices' ? t('items.invoices.eyebrow') : undefined
              }
              title={t(`items.${key}.title`)}
              body={t(`items.${key}.body`)}
              badge={
                key === 'contracts' ? t('items.contracts.badge') : undefined
              }
            />
            {key === 'invoices' && <InvoicesPagePreview />}
            {key === 'dashboard' && <CompactDashboardPreview />}
            {key === 'clients' && <ClientsPagePreview />}
            {key === 'contracts' && <ContractsSoonPreview />}
          </Tile>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        {capabilityTiles.map(({ key, icon, className }) => (
          <Tile key={key} className={className}>
            <TileBody
              icon={icon}
              title={t(`capabilities.${key}.title`)}
              body={t(`capabilities.${key}.body`)}
              badge={
                key === 'payments'
                  ? t('capabilities.payments.badge')
                  : undefined
              }
              badgeColor={key === 'payments' ? 'success' : undefined}
            />
            {key === 'language' && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {['EN', 'LT'].map((language) => (
                  <span
                    key={language}
                    className="bg-default-50 text-default-600 rounded-xl border px-2 py-1 text-[11px] font-medium"
                  >
                    {language}
                  </span>
                ))}
              </div>
            )}
            {key === 'export' && (
              <div className="bg-default-50 text-default-500 mt-5 inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-[11px]">
                <ArrowDownTrayIcon className="h-3 w-3" />
                invoices_2026.csv
              </div>
            )}
          </Tile>
        ))}
      </div>
    </section>
  );
}
