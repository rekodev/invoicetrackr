'use client';

import { useTranslations } from 'next-intl';

const LAST_UPDATED = 'October 30, 2025';
const CONTACT_EMAIL = 'invoicetrackr@gmail.com';

export function TermsOfServiceContent() {
  const t = useTranslations('terms_of_service');

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {t('last_updated', { date: LAST_UPDATED })}
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.agreement.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.agreement.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.description.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.description.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('sections.description.items.creation')}</li>
            <li>{t('sections.description.items.tracking')}</li>
            <li>{t('sections.description.items.clients')}</li>
            <li>{t('sections.description.items.dashboard')}</li>
            <li>{t('sections.description.items.contracts')}</li>
            <li>{t('sections.description.items.pdf')}</li>
            <li>{t('sections.description.items.email')}</li>
            <li>{t('sections.description.items.multi')}</li>
            <li>{t('sections.description.items.banking')}</li>
            <li>{t('sections.description.items.signature')}</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.account_registration.heading')}
          </h2>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.account_registration.creation.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.account_registration.creation.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('sections.account_registration.creation.items.accurate')}</li>
            <li>{t('sections.account_registration.creation.items.maintain')}</li>
            <li>{t('sections.account_registration.creation.items.security')}</li>
            <li>{t('sections.account_registration.creation.items.responsibility')}</li>
            <li>{t('sections.account_registration.creation.items.notify')}</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.account_registration.eligibility.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.account_registration.eligibility.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.subscription.heading')}
          </h2>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.subscription.free.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.subscription.free.content')}
          </p>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.subscription.premium.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.subscription.premium.content')}
          </p>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.subscription.payment.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.subscription.payment.content')}
          </p>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.subscription.cancellation.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.subscription.cancellation.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.user_content.heading')}
          </h2>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.user_content.your_content.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.user_content.your_content.content')}
          </p>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.user_content.responsibility.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.user_content.responsibility.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('sections.user_content.responsibility.items.own')}</li>
            <li>{t('sections.user_content.responsibility.items.rights')}</li>
            <li>{t('sections.user_content.responsibility.items.laws')}</li>
            <li>{t('sections.user_content.responsibility.items.viruses')}</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.user_content.backup.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.user_content.backup.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.acceptable_use.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.acceptable_use.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('sections.acceptable_use.items.violate')}</li>
            <li>{t('sections.acceptable_use.items.infringe')}</li>
            <li>{t('sections.acceptable_use.items.transmit')}</li>
            <li>{t('sections.acceptable_use.items.fraudulent')}</li>
            <li>{t('sections.acceptable_use.items.viruses')}</li>
            <li>{t('sections.acceptable_use.items.unauthorized')}</li>
            <li>{t('sections.acceptable_use.items.interfere')}</li>
            <li>{t('sections.acceptable_use.items.automated')}</li>
            <li>{t('sections.acceptable_use.items.resell')}</li>
            <li>{t('sections.acceptable_use.items.illegal')}</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.intellectual_property.heading')}
          </h2>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.intellectual_property.our_rights.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.intellectual_property.our_rights.content')}
          </p>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.intellectual_property.feedback.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.intellectual_property.feedback.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.third_party.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.third_party.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Stripe:</strong> {t('sections.third_party.stripe')}
            </li>
            <li>
              <strong>Cloudinary:</strong> {t('sections.third_party.cloudinary')}
            </li>
            <li>
              <strong>Google Analytics:</strong> {t('sections.third_party.analytics')}
            </li>
          </ul>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.third_party.disclaimer')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.service_availability.heading')}
          </h2>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.service_availability.availability.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.service_availability.availability.content')}
          </p>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.service_availability.modifications.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.service_availability.modifications.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.disclaimers.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.disclaimers.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('sections.disclaimers.items.merchantability')}</li>
            <li>{t('sections.disclaimers.items.accuracy')}</li>
            <li>{t('sections.disclaimers.items.uninterrupted')}</li>
            <li>{t('sections.disclaimers.items.defects')}</li>
          </ul>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.disclaimers.disclaimer')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.limitation.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.limitation.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('sections.limitation.items.indirect')}</li>
            <li>{t('sections.limitation.items.loss')}</li>
            <li>{t('sections.limitation.items.content')}</li>
            <li>{t('sections.limitation.items.use')}</li>
            <li>{t('sections.limitation.items.third_party')}</li>
          </ul>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.limitation.cap')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.indemnification.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.indemnification.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('sections.indemnification.items.access')}</li>
            <li>{t('sections.indemnification.items.violation')}</li>
            <li>{t('sections.indemnification.items.third_party')}</li>
            <li>{t('sections.indemnification.items.content')}</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.termination.heading')}
          </h2>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.termination.by_you.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.termination.by_you.content')}
          </p>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.termination.by_us.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.termination.by_us.intro')}
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('sections.termination.by_us.items.violation')}</li>
            <li>{t('sections.termination.by_us.items.security')}</li>
            <li>{t('sections.termination.by_us.items.fraud')}</li>
            <li>{t('sections.termination.by_us.items.law')}</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.termination.effect.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.termination.effect.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.governing_law.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.governing_law.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.general.heading')}
          </h2>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.general.entire.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.general.entire.content')}
          </p>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.general.severability.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.general.severability.content')}
          </p>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.general.waiver.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.general.waiver.content')}
          </p>

          <h3 className="mb-3 text-xl font-medium">
            {t('sections.general.assignment.heading')}
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.general.assignment.content')}
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {t('sections.contact.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('sections.contact.intro')}
          </p>
          <div className="dark:border-default-100 border-default-300 rounded-md border p-4">
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
