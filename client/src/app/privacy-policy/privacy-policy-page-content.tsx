'use client';

import { useTranslations } from 'next-intl';

const LAST_UPDATED = '10/12/2026';
const SERVICE_PROVIDERS = [
  'hosting',
  'database',
  'email',
  'storage',
  'analytics',
  'google'
] as const;
const LEGAL_BASES = [
  'contract',
  'legal_obligation',
  'legitimate_interests',
  'consent'
] as const;
const RIGHTS = [
  'access',
  'correction',
  'deletion',
  'portability',
  'objection',
  'restriction',
  'opt_out',
  'withdraw'
] as const;
const CONTACT_EMAIL = 'support@invoicetrackr.app';

export default function PrivacyPolicyPageContent() {
  const t = useTranslations('privacy_policy');

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {t('last_updated', { date: LAST_UPDATED })}
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.introduction.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.introduction.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.information_we_collect.heading')}
          </h2>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.information_we_collect.personal_info.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.information_we_collect.personal_info.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              {t('sections.information_we_collect.personal_info.items.name')}
            </li>
            <li>
              {t('sections.information_we_collect.personal_info.items.email')}
            </li>
            <li>
              {t(
                'sections.information_we_collect.personal_info.items.business_type'
              )}
            </li>
            <li>
              {t(
                'sections.information_we_collect.personal_info.items.registration'
              )}
            </li>
            <li>
              {t('sections.information_we_collect.personal_info.items.address')}
            </li>
            <li>
              {t('sections.information_we_collect.personal_info.items.profile')}
            </li>
            <li>
              {t(
                'sections.information_we_collect.personal_info.items.signature'
              )}
            </li>
            <li>
              {t(
                'sections.information_we_collect.personal_info.items.preferences'
              )}
            </li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.information_we_collect.financial_info.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.information_we_collect.financial_info.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              {t(
                'sections.information_we_collect.financial_info.items.banking'
              )}
            </li>
            <li>
              {t(
                'sections.information_we_collect.financial_info.items.invoice'
              )}
            </li>
            <li>
              {t('sections.information_we_collect.financial_info.items.client')}
            </li>
            <li>
              {t(
                'sections.information_we_collect.financial_info.items.expenses'
              )}
            </li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.information_we_collect.payment_info.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.information_we_collect.payment_info.content')}
          </p>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.information_we_collect.usage_info.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.information_we_collect.usage_info.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('sections.information_we_collect.usage_info.items.ip')}</li>
            <li>
              {t('sections.information_we_collect.usage_info.items.browser')}
            </li>
            <li>
              {t('sections.information_we_collect.usage_info.items.pages')}
            </li>
            <li>
              {t('sections.information_we_collect.usage_info.items.time')}
            </li>
            <li>
              {t('sections.information_we_collect.usage_info.items.referring')}
            </li>
            <li>
              {t('sections.information_we_collect.usage_info.items.errors')}
            </li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.information_we_collect.analytics_data.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.information_we_collect.analytics_data.intro')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.how_we_use.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.how_we_use.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('sections.how_we_use.items.provide')}</li>
            <li>{t('sections.how_we_use.items.create')}</li>
            <li>{t('sections.how_we_use.items.process')}</li>
            <li>{t('sections.how_we_use.items.generate')}</li>
            <li>{t('sections.how_we_use.items.send')}</li>
            <li>{t('sections.how_we_use.items.display')}</li>
            <li>{t('sections.how_we_use.items.support')}</li>
            <li>{t('sections.how_we_use.items.admin')}</li>
            <li>{t('sections.how_we_use.items.improve')}</li>
            <li>{t('sections.how_we_use.items.analyze')}</li>
            <li>{t('sections.how_we_use.items.detect')}</li>
            <li>{t('sections.how_we_use.items.comply')}</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.legal_bases.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.legal_bases.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            {LEGAL_BASES.map((basis) => (
              <li key={basis}>{t(`sections.legal_bases.items.${basis}`)}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.how_we_share.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.how_we_share.intro')}
          </p>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.how_we_share.service_providers.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.how_we_share.service_providers.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            {SERVICE_PROVIDERS.map((provider) => (
              <li key={provider}>
                <strong>
                  {t(
                    `sections.how_we_share.service_providers.items.${provider}.name`
                  )}
                  :
                </strong>{' '}
                {t(
                  `sections.how_we_share.service_providers.items.${provider}.description`
                )}
              </li>
            ))}
          </ul>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.how_we_share.legal.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.how_we_share.legal.content')}
          </p>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.how_we_share.business_transfers.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.how_we_share.business_transfers.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.data_security.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.data_security.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('sections.data_security.items.encryption')}</li>
            <li>{t('sections.data_security.items.hashing')}</li>
            <li>{t('sections.data_security.items.assessments')}</li>
            <li>{t('sections.data_security.items.access')}</li>
          </ul>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.data_security.disclaimer')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.data_retention.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.data_retention.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.your_rights.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.your_rights.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            {RIGHTS.map((right) => (
              <li key={right}>
                <strong>
                  {t(`sections.your_rights.items.${right}.title`)}:
                </strong>{' '}
                {t(`sections.your_rights.items.${right}.description`)}
              </li>
            ))}
          </ul>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.your_rights.outro')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.cookies.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.cookies.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.third_party_links.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.third_party_links.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.children_privacy.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.children_privacy.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.international_transfers.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.international_transfers.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.changes.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.changes.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.contact.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.contact.intro')}
          </p>
          <div className="rounded-md border p-4">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>{t('sections.contact.company')}</strong>
              <br />
              {t('sections.contact.email', { email: CONTACT_EMAIL })}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
