import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'InvoiceTrackr Terms of Service',
  description:
    'Review the terms of service for using InvoiceTrackr, including account usage, billing, and legal agreements.',
  keywords: [
    'terms of service',
    'legal',
    'agreements',
    'billing',
    'account usage'
  ],
  authors: [{ name: 'InvoiceTrackr' }],
  creator: 'InvoiceTrackr',
  openGraph: {
    type: 'website',
    siteName: 'InvoiceTrackr',
    title: 'InvoiceTrackr Terms of Service',
    description:
      'Review the terms of service for using InvoiceTrackr, including account usage, billing, and legal agreements.',
    url: '/terms-of-service'
  },
  alternates: {
    canonical: '/terms-of-service'
  }
};

const LAST_UPDATED = 'October 30, 2025';
const CONTACT_EMAIL = 'invoicetrackr@gmail.com';

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">
        Terms of Service
      </h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Last Updated: {LAST_UPDATED}
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">1. Agreement to Terms</h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            By accessing or using InvoiceTrackr ("Service," "we," "our," or
            "us"), you agree to be bound by these Terms of Service ("Terms"). If
            you do not agree to these Terms, you may not access or use the
            Service.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            2. Description of Service
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            InvoiceTrackr is an online invoice generation, tracking, and
            management platform designed for freelancers and small businesses.
            Our Service provides:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>Invoice creation, editing, and management</li>
            <li>Invoice status tracking (paid, pending, canceled)</li>
            <li>Client information management</li>
            <li>Financial dashboard with income analytics and charts</li>
            <li>Contract creation and management (premium feature)</li>
            <li>PDF invoice generation and export</li>
            <li>Email invoice delivery</li>
            <li>Multi-currency and multi-language support</li>
            <li>Banking information storage for invoicing purposes</li>
            <li>Digital signature functionality</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            3. Account Registration
          </h2>

          <h3 className="mb-3 text-xl font-medium">3.1 Account Creation</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            To access certain features of the Service, you must register for an
            account. You agree to:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security of your password and account</li>
            <li>
              Accept all responsibility for activities that occur under your
              account
            </li>
            <li>
              Notify us immediately of any unauthorized use of your account
            </li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">3.2 Account Eligibility</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            You must be at least 18 years old to create an account and use the
            Service. By creating an account, you represent and warrant that you
            meet this age requirement.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">4. Subscription Plans</h2>

          <h3 className="mb-3 text-xl font-medium">4.1 Free Plan</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            Our free plan allows you to create unlimited invoices, use basic
            invoice templates, export to PDF, and add your signature.
          </p>

          <h3 className="mb-3 text-xl font-medium">4.2 Premium Plan</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            Our premium plan ($4.99/month) includes all free features plus the
            ability to save and edit invoices, store client information, create
            and manage contracts, choose currency and language preferences, and
            email invoices directly to clients.
          </p>

          <h3 className="mb-3 text-xl font-medium">4.3 Payment Terms</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            Premium subscriptions are billed monthly in advance. Payment
            processing is handled securely by Stripe, a third-party payment
            processor. By subscribing to a premium plan, you authorize us to
            charge your payment method on a recurring basis.
          </p>

          <h3 className="mb-3 text-xl font-medium">
            4.4 Cancellation and Refunds
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            You may cancel your subscription at any time through your account
            settings. Cancellations will take effect at the end of your current
            billing period. We do not provide refunds for partial months of
            service or unused features.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            5. User Content and Data
          </h2>

          <h3 className="mb-3 text-xl font-medium">5.1 Your Content</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            You retain all rights to the content you create, upload, or store
            through the Service, including invoices, client information, and
            other data ("Your Content"). By using the Service, you grant us a
            limited license to use, store, and process Your Content solely to
            provide and improve the Service.
          </p>

          <h3 className="mb-3 text-xl font-medium">
            5.2 Content Responsibility
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            You are solely responsible for Your Content and the consequences of
            posting or publishing it. You represent and warrant that:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>You own or have the necessary rights to Your Content</li>
            <li>Your Content does not violate any third-party rights</li>
            <li>
              Your Content does not violate any applicable laws or regulations
            </li>
            <li>Your Content does not contain viruses or malicious code</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">5.3 Data Backup</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            While we implement backup procedures, you are responsible for
            maintaining your own backups of Your Content. We are not liable for
            any loss or corruption of Your Content.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            6. Acceptable Use Policy
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            You agree not to use the Service to:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>Violate any laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Transmit fraudulent, false, or misleading information</li>
            <li>Create fraudulent invoices or engage in financial fraud</li>
            <li>Upload viruses or malicious code</li>
            <li>
              Attempt to gain unauthorized access to the Service or other users'
              accounts
            </li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>
              Use automated systems (bots, scrapers) without our written
              permission
            </li>
            <li>Resell or redistribute the Service without authorization</li>
            <li>Use the Service for any illegal or unauthorized purpose</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            7. Intellectual Property Rights
          </h2>

          <h3 className="mb-3 text-xl font-medium">7.1 Our Rights</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            The Service and its original content, features, and functionality
            are owned by InvoiceTrackr and are protected by international
            copyright, trademark, patent, trade secret, and other intellectual
            property laws. Our trademarks and trade dress may not be used
            without our prior written permission.
          </p>

          <h3 className="mb-3 text-xl font-medium">7.2 Feedback</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            If you provide us with feedback, suggestions, or ideas about the
            Service, you grant us the right to use such feedback without any
            obligation to you.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            8. Third-Party Services
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            The Service integrates with or relies on third-party services,
            including:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Stripe:</strong> Payment processing
            </li>
            <li>
              <strong>Cloudinary:</strong> Image hosting
            </li>
            <li>
              <strong>Google Analytics:</strong> Website analytics
            </li>
          </ul>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            Your use of these third-party services is subject to their
            respective terms of service and privacy policies. We are not
            responsible for the availability, functionality, or practices of
            these third-party services.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            9. Service Availability and Modifications
          </h2>

          <h3 className="mb-3 text-xl font-medium">9.1 Service Availability</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            We strive to maintain high service availability, but we do not
            guarantee that the Service will be uninterrupted, secure, or
            error-free. We may suspend or discontinue the Service at any time
            for maintenance, updates, or other reasons.
          </p>

          <h3 className="mb-3 text-xl font-medium">
            9.2 Service Modifications
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            We reserve the right to modify, suspend, or discontinue any aspect
            of the Service at any time without notice. We may also modify these
            Terms at any time. Your continued use of the Service after such
            modifications constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">10. Disclaimers</h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
            WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT
            PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT
            LIMITED TO:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              Warranties of merchantability, fitness for a particular purpose,
              and non-infringement
            </li>
            <li>
              Warranties regarding the accuracy, reliability, or completeness of
              the Service
            </li>
            <li>
              Warranties that the Service will be uninterrupted or error-free
            </li>
            <li>Warranties that defects will be corrected</li>
          </ul>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            You acknowledge that InvoiceTrackr is a tool for invoice management
            and that you are responsible for the accuracy and legality of the
            invoices you create. We do not provide financial, legal, or tax
            advice.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            11. Limitation of Liability
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            TO THE FULLEST EXTENT PERMITTED BY LAW, INVOICETRACKR SHALL NOT BE
            LIABLE FOR:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              Any indirect, incidental, special, consequential, or punitive
              damages
            </li>
            <li>Loss of profits, revenue, data, or use</li>
            <li>Loss of or damage to Your Content</li>
            <li>
              Any damages resulting from your use or inability to use the
              Service
            </li>
            <li>
              Any damages resulting from third-party services or integrations
            </li>
          </ul>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID TO
            US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE
            LIABILITY, OR $100, WHICHEVER IS GREATER.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">12. Indemnification</h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            You agree to indemnify, defend, and hold harmless InvoiceTrackr and
            its officers, directors, employees, and agents from and against any
            claims, liabilities, damages, losses, and expenses, including
            reasonable attorneys' fees, arising out of or in any way connected
            with:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>Your access to or use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
            <li>Your Content or any invoices you create</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">13. Termination</h2>

          <h3 className="mb-3 text-xl font-medium">13.1 Termination by You</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            You may terminate your account at any time by contacting us or
            through your account settings.
          </p>

          <h3 className="mb-3 text-xl font-medium">13.2 Termination by Us</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            We may suspend or terminate your access to the Service at any time,
            with or without cause or notice, including if:
          </p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>You violate these Terms</li>
            <li>Your use of the Service poses a security risk</li>
            <li>You engage in fraudulent or illegal activities</li>
            <li>We are required to do so by law</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">
            13.3 Effect of Termination
          </h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            Upon termination, your right to use the Service will immediately
            cease. We may delete Your Content in accordance with our data
            retention policies. Provisions of these Terms that by their nature
            should survive termination shall survive, including intellectual
            property rights, disclaimers, limitations of liability, and dispute
            resolution provisions.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            14. Governing Law and Dispute Resolution
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            These Terms shall be governed by and construed in accordance with
            the laws of the jurisdiction in which InvoiceTrackr operates,
            without regard to its conflict of law provisions. Any disputes
            arising from these Terms or your use of the Service shall be
            resolved through binding arbitration, except that either party may
            seek injunctive relief in court for intellectual property
            infringement or violations of these Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            15. General Provisions
          </h2>

          <h3 className="mb-3 text-xl font-medium">15.1 Entire Agreement</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            These Terms, together with our Privacy Policy, constitute the entire
            agreement between you and InvoiceTrackr regarding the Service.
          </p>

          <h3 className="mb-3 text-xl font-medium">15.2 Severability</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            If any provision of these Terms is found to be unenforceable, that
            provision shall be limited or eliminated to the minimum extent
            necessary, and the remaining provisions shall remain in full force
            and effect.
          </p>

          <h3 className="mb-3 text-xl font-medium">15.3 Waiver</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            Our failure to enforce any right or provision of these Terms shall
            not be deemed a waiver of such right or provision.
          </p>

          <h3 className="mb-3 text-xl font-medium">15.4 Assignment</h3>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            You may not assign or transfer these Terms or your rights under them
            without our prior written consent. We may assign these Terms without
            restriction.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            16. Contact Information
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            If you have any questions about these Terms of Service, please
            contact us at:
          </p>
          <div className="dark:border-default-100 border-default-300 rounded-md border p-4">
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
