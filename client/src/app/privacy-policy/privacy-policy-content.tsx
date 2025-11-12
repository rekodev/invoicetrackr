'use client';

import { useTranslations } from 'next-intl';

const LAST_UPDATED = '10/30/2025';
const CONTACT_EMAIL = 'invoicetrackr@gmail.com';

export function PrivacyPolicyContent() {
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
          </ul>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.information_we_collect.analytics_data.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.information_we_collect.analytics_data.intro')}{' '}
            <a
              href="https://policies.google.com/privacy"
              className="text-secondary-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://policies.google.com/privacy
            </a>
            .
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
            <li>
              <strong>Stripe:</strong>{' '}
              {t('sections.how_we_share.service_providers.items.stripe')}
            </li>
            <li>
              <strong>Cloudinary:</strong>{' '}
              {t('sections.how_we_share.service_providers.items.cloudinary')}
            </li>
            <li>
              <strong>Google Analytics:</strong>{' '}
              {t('sections.how_we_share.service_providers.items.analytics')}
            </li>
            <li>
              <strong>
                {t('sections.how_we_share.service_providers.items.email')}
              </strong>
            </li>
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
            <li>
              <strong>{t('sections.your_rights.items.access.title')}:</strong>{' '}
              {t('sections.your_rights.items.access.description')}
            </li>
            <li>
              <strong>
                {t('sections.your_rights.items.correction.title')}:
              </strong>{' '}
              {t('sections.your_rights.items.correction.description')}
            </li>
            <li>
              <strong>{t('sections.your_rights.items.deletion.title')}:</strong>{' '}
              {t('sections.your_rights.items.deletion.description')}
            </li>
            <li>
              <strong>
                {t('sections.your_rights.items.portability.title')}:
              </strong>{' '}
              {t('sections.your_rights.items.portability.description')}
            </li>
            <li>
              <strong>{t('sections.your_rights.items.opt_out.title')}:</strong>{' '}
              {t('sections.your_rights.items.opt_out.description')}
            </li>
            <li>
              <strong>{t('sections.your_rights.items.withdraw.title')}:</strong>{' '}
              {t('sections.your_rights.items.withdraw.description')}
            </li>
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
          <div className="border-default-300 dark:border-default-100 rounded-md border p-4">
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
