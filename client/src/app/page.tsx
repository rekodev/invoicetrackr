'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import { Button, Link } from '@heroui/react';
import Image from 'next/image';

import { CREATE_INVOICE_PAGE, SIGN_UP_PAGE } from '@/lib/constants/pages';
import { getCurrencySymbol, getUserCurrency } from '@/lib/utils/currency';

export default function Home() {
  const renderDivider = () => (
    <div className="border-default-300 dark:border-default-100 w-full border-t" />
  );

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-6 py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Create Professional Invoices in Minutes
                </h1>
                <p className="text-muted-foreground max-w-[600px] md:text-xl">
                  Simple, powerful, and free invoice generator for freelancers
                  and small businesses. No account required to get started.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  as={Link}
                  href={CREATE_INVOICE_PAGE}
                  size="lg"
                  color="secondary"
                  className="px-8"
                >
                  Create Free Invoice
                </Button>
                <Button as={Link} href="#pricing" variant="ghost" size="lg">
                  See Premium Features
                </Button>
              </div>
            </div>
            <Image
              src="https://res.cloudinary.com/dpc8mowbo/image/upload/fl_preserve_transparency/v1742077159/amyxvmvgwypog08nu4mp.jpg?_s=public-apps"
              width={850}
              height={550}
              alt="Invoice app dashboard preview"
              className="mx-auto overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              unoptimized
            />
          </div>
        </section>

        {renderDivider()}

        <section
          id="features"
          className="max-w-8xl bg-muted mx-auto w-full max-w-7xl px-6 py-12 md:py-24 lg:py-32"
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Everything You Need for Professional Invoicing
              </h2>
              <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl">
                Our intuitive invoice generator helps you create, customize, and
                export professional invoices in seconds.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-7xl items-center gap-12 py-12 lg:grid-cols-2 lg:gap-12">
            <Image
              src="https://res.cloudinary.com/dpc8mowbo/image/upload/fl_preserve_transparency/v1742079914/bmnbendbuwp8ydtusijr.jpg?_s=public-apps"
              width={850}
              height={550}
              alt="Invoice editor interface"
              className="mx-auto overflow-hidden rounded-xl object-cover object-center sm:w-full"
              unoptimized
            />
            <div className="flex flex-col justify-center space-y-4">
              <ul className="grid gap-6">
                <li className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-1">
                    <CheckIcon className="text-secondary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Save & Edit Invoices</h3>
                    <p className="text-muted-foreground">
                      Easily create, save, and edit invoices whenever needed,
                      ensuring flexibility in your billing process.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-1">
                    <CheckIcon className="text-secondary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Income Dashboard</h3>
                    <p className="text-muted-foreground">
                      Get a clear overview of your earnings with a visual income
                      dashboard displaying monthly trends and recent invoices.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-1">
                    <CheckIcon className="text-secondary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Multi-Currency & Language</h3>
                    <p className="text-muted-foreground">
                      Customize invoices with your preferred currency and
                      language to suit international clients.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {renderDivider()}

        <section
          id="pricing"
          className="mx-auto w-full max-w-7xl px-6 py-12 md:py-24 lg:py-32"
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Simple, Transparent Pricing
              </h2>
              <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl">
                Start for free, upgrade when you need more features.
              </p>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-6 py-12 lg:flex-row">
            <div className="bg-card text-card-foreground border-default-300 dark:border-default-100 flex min-h-[472px] w-full max-w-md flex-col justify-between rounded-lg border shadow-sm">
              <div>
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-2xl font-bold">Free</h3>
                  <p className="text-muted-foreground">
                    Create and export basic invoices
                  </p>
                </div>
                <div className="p-6 pt-0">
                  <div className="text-4xl font-bold">
                    {getCurrencySymbol(getUserCurrency())}0
                  </div>
                  <div className="text-muted-foreground">Forever free</div>
                </div>
                <div className="p-6 pt-0">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckIcon className="text-secondary h-4 w-4" />
                      <span>Create unlimited invoices</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="text-secondary h-4 w-4" />
                      <span>Basic invoice template</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="text-secondary h-4 w-4" />
                      <span>Export to PDF</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="text-secondary h-4 w-4" />
                      <span>Add your signature</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col p-6 pt-0">
                <Button as={Link} href={CREATE_INVOICE_PAGE}>
                  Get Started
                </Button>
              </div>
            </div>
            <div className="border-secondary-500 bg-secondary-50 flex w-full max-w-md flex-col rounded-lg border bg-opacity-50 shadow-sm dark:bg-opacity-100">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-bold">Premium</h3>
                <p>Everything you need for efficient invoicing</p>
              </div>
              <div className="p-6 pt-0">
                <div className="text-4xl font-bold">
                  {getCurrencySymbol(getUserCurrency())}4.99
                </div>
                <div>per month</div>
              </div>
              <div className="p-6 pt-0">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="text-secondary dark:text-secondary-600 h-4 w-4" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="text-secondary dark:text-secondary-600 h-4 w-4" />
                    <span>Save and edit invoices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="text-secondary dark:text-secondary-600 h-4 w-4" />
                    <span>Store client information</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="text-secondary dark:text-secondary-600 h-4 w-4" />
                    <span>Create and manage contracts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="text-secondary dark:text-secondary-600 h-4 w-4" />
                    <span>Choose currency and language</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="text-secondary dark:text-secondary-600 h-4 w-4" />
                    <span>Email invoices directly</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col p-6 pt-0">
                <Button
                  as={Link}
                  href={SIGN_UP_PAGE}
                  variant="solid"
                  color="secondary"
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        </section>

        {renderDivider()}

        <section className="bg-muted mx-auto w-full max-w-7xl px-6 py-12 md:py-24 lg:py-32">
          <div className="grid gap-12 md:gap-16 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to streamline your invoicing process?
              </h2>
              <p className="text-muted-foreground md:text-xl">
                Start creating professional invoices today, no credit card
                required.
              </p>
              <Button
                as={Link}
                href={CREATE_INVOICE_PAGE}
                size="lg"
                className="px-8"
              >
                Try For Free
              </Button>
            </div>
            <div className="flex flex-col items-start space-y-4">
              <div className="bg-background inline-block rounded-lg px-3 py-1 text-sm">
                Testimonial
              </div>
              <blockquote className="text-lg font-semibold">
                "InvoiceTrackr has completely transformed how I handle
                invoicing. The free version is great to start, but the premium
                features save me hours every month."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="bg-muted-foreground/20 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground/70 h-10 w-10"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Nikita K.</div>
                  <div className="text-muted-foreground text-sm">
                    Freelance Data Analyst
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
