const LAST_UPDATED = 'October 30, 2025';
const CONTACT_EMAIL = 'invoicetrackr@gmail.com';

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Last Updated: {LAST_UPDATED}
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">1. Introduction</h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            Welcome to InvoiceTrackr ("we," "our," or "us"). We are committed to
            protecting your privacy and ensuring the security of your personal
            information. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you use our invoice
            tracking and management service.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            2. Information We Collect
          </h2>

          <h3 className="mb-3 text-xl font-medium">2.1 Personal Information</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            When you register for an account, we collect:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>Name and business information</li>
            <li>Email address</li>
            <li>Business type (individual or business entity)</li>
            <li>Business registration number</li>
            <li>Business address</li>
            <li>Profile picture (optional)</li>
            <li>Digital signature (optional)</li>
            <li>Language and currency preferences</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">
            2.2 Financial Information
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            To enable invoice functionality, we collect:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>Banking information (bank name, code, and account number)</li>
            <li>Invoice data including amounts, dates, and payment statuses</li>
            <li>Client information for invoicing purposes</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">2.3 Payment Information</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            Payment processing is handled by Stripe, a third-party payment
            processor. We do not store your credit card information. We only
            retain your Stripe customer ID and subscription ID for account
            management purposes.
          </p>

          <h3 className="mb-3 text-xl font-medium">2.4 Usage Information</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            We automatically collect certain information about your device and
            how you interact with our service:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Pages viewed and features used</li>
            <li>Time and date of visits</li>
            <li>Referring website addresses</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">2.5 Analytics Data</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            We use Google Analytics to understand how visitors use our website.
            Google Analytics collects information such as how often users visit
            our site, what pages they visit, and what other sites they used
            prior to visiting. We use this information to improve our service
            and user experience. Google Analytics may use cookies and other
            tracking technologies. You can learn more about Google's privacy
            practices at{' '}
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
            3. How We Use Your Information
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            We use the collected information for the following purposes:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              To provide, operate, and maintain our invoice tracking service
            </li>
            <li>To create and manage your account</li>
            <li>To process your transactions and manage subscriptions</li>
            <li>To generate, store, and export invoices and contracts</li>
            <li>To send invoice-related emails to your clients</li>
            <li>To display your income dashboard and financial analytics</li>
            <li>To provide customer support and respond to your inquiries</li>
            <li>To send administrative information and service updates</li>
            <li>To improve our service and develop new features</li>
            <li>To analyze usage patterns and trends</li>
            <li>To detect and prevent fraud or unauthorized access</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            4. How We Share Your Information
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            We do not sell your personal information. We may share your
            information in the following circumstances:
          </p>

          <h3 className="mb-3 text-xl font-medium">4.1 Service Providers</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            We share information with third-party service providers who perform
            services on our behalf:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Stripe:</strong> Payment processing for subscription
              management
            </li>
            <li>
              <strong>Cloudinary:</strong> Image hosting for profile pictures
              and other media
            </li>
            <li>
              <strong>Google Analytics:</strong> Website analytics and visitor
              tracking
            </li>
            <li>
              <strong>Email service providers:</strong> To send invoice-related
              emails
            </li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">4.2 Legal Requirements</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            We may disclose your information if required to do so by law or in
            response to valid requests by public authorities (e.g., a court or
            government agency).
          </p>

          <h3 className="mb-3 text-xl font-medium">4.3 Business Transfers</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            In the event of a merger, acquisition, or sale of all or a portion
            of our assets, your information may be transferred as part of that
            transaction.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">5. Data Security</h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            We implement appropriate technical and organizational security
            measures to protect your information against unauthorized access,
            alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>Encryption of data in transit using SSL/TLS</li>
            <li>Password hashing using industry-standard algorithms</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication mechanisms</li>
          </ul>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            However, no method of transmission over the Internet or electronic
            storage is 100% secure. While we strive to protect your information,
            we cannot guarantee its absolute security.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">6. Data Retention</h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            We retain your personal information for as long as necessary to
            fulfill the purposes outlined in this Privacy Policy, unless a
            longer retention period is required or permitted by law. When you
            delete your account, we will delete or anonymize your personal
            information, except where we are required to retain it for legal,
            tax, or accounting purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            7. Your Rights and Choices
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            Depending on your location, you may have the following rights
            regarding your personal information:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Access:</strong> Request access to your personal
              information
            </li>
            <li>
              <strong>Correction:</strong> Request correction of inaccurate
              information
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal
              information
            </li>
            <li>
              <strong>Portability:</strong> Request a copy of your data in a
              structured format
            </li>
            <li>
              <strong>Opt-out:</strong> Opt-out of marketing communications
            </li>
            <li>
              <strong>Withdraw consent:</strong> Withdraw consent where
              processing is based on consent
            </li>
          </ul>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            To exercise these rights, please contact us using the information
            provided in the "Contact Us" section below.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            8. Cookies and Tracking Technologies
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            We use cookies and similar tracking technologies to track activity
            on our service and store certain information. Cookies are files with
            a small amount of data that are stored on your device. You can
            instruct your browser to refuse all cookies or to indicate when a
            cookie is being sent. However, if you do not accept cookies, you may
            not be able to use some features of our service.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">9. Third-Party Links</h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            Our service may contain links to third-party websites or services.
            We are not responsible for the privacy practices or content of these
            third parties. We encourage you to read the privacy policies of any
            third-party sites you visit.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            10. Children's Privacy
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            Our service is not intended for individuals under the age of 18. We
            do not knowingly collect personal information from children under
            18. If you are a parent or guardian and believe your child has
            provided us with personal information, please contact us so we can
            delete it.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            11. International Data Transfers
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            Your information may be transferred to and processed in countries
            other than your country of residence. These countries may have data
            protection laws that are different from the laws of your country. We
            take appropriate measures to ensure that your personal information
            remains protected in accordance with this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            12. Changes to This Privacy Policy
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or legal requirements. We will notify you
            of any material changes by posting the new Privacy Policy on this
            page and updating the "Last Updated" date. We encourage you to
            review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">13. Contact Us</h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            If you have any questions about this Privacy Policy or our privacy
            practices, please contact us at:
          </p>
          <div className="border-default-300 dark:border-default-100 rounded-md border p-4">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>InvoiceTrackr</strong>
              <br />
              Email: {CONTACT_EMAIL}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
