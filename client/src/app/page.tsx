"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";

import { CREATE_INVOICE_PAGE, SIGN_UP_PAGE } from "@/lib/constants/pages";

export default function Home() {
  const renderDivider = () => (
    <div className="w-full border-t border-default-100" />
  );

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="max-w-7xl px-6 mx-auto w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Create Professional Invoices in Minutes
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Simple, powerful, and free invoice generator for freelancers
                  and small businesses. No account required to get started.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" color="secondary" className="px-8">
                  <Link href={CREATE_INVOICE_PAGE}>Create Free Invoice</Link>
                </Button>
                <Button variant="ghost" size="lg">
                  <Link href="#pricing">See Premium Features</Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://res.cloudinary.com/dpc8mowbo/image/upload/fl_preserve_transparency/v1742077159/amyxvmvgwypog08nu4mp.jpg?_s=public-apps"
              width={850}
              height={550}
              alt="Invoice app dashboard preview"
              className="mx-auto overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
            />
          </div>
        </section>

        {renderDivider()}

        <section
          id="features"
          className="max-w-8xl max-w-7xl mx-auto px-6 w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Everything You Need for Professional Invoicing
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
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
            />
            <div className="flex flex-col justify-center space-y-4">
              <ul className="grid gap-6">
                <li className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-1">
                    <CheckIcon className="h-5 w-5 text-secondary" />
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
                  <div className="rounded-full bg-primary/10 p-1">
                    <CheckIcon className="h-5 w-5 text-secondary" />
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
                  <div className="rounded-full bg-primary/10 p-1">
                    <CheckIcon className="h-5 w-5 text-secondary" />
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
          className="max-w-7xl mx-auto w-full px-6 py-12 md:py-24 lg:py-32"
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Simple, Transparent Pricing
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Start for free, upgrade when you need more features.
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-7xl flex flex-col justify-center gap-6 py-12 lg:flex-row">
            <div className="flex flex-col max-w-md w-full border-default-100 rounded-lg border justify-between bg-card text-card-foreground shadow-sm">
              <div>
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-2xl font-bold">Free</h3>
                  <p className="text-muted-foreground">
                    Create and export basic invoices
                  </p>
                </div>
                <div className="p-6 pt-0">
                  <div className="text-4xl font-bold">$0</div>
                  <div className="text-muted-foreground">Forever free</div>
                </div>
                <div className="p-6 pt-0">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-secondary" />
                      <span>Create unlimited invoices</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-secondary" />
                      <span>Basic invoice template</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-secondary" />
                      <span>Export to PDF</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-secondary" />
                      <span>Add your signature</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col p-6 pt-0">
                <Button>
                  <Link href={CREATE_INVOICE_PAGE}>Get Started</Link>
                </Button>
              </div>
            </div>
            <div className="w-full max-w-md bg-secondary-50 bg-opacity-50 flex flex-col rounded-lg border border-secondary-500 text-primary-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-bold">Premium</h3>
                <p className="text-primary-foreground/80">
                  Everything you need for efficient invoicing
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="text-4xl font-bold">$9.99</div>
                <div className="text-primary-foreground/80">per month</div>
              </div>
              <div className="p-6 pt-0">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    <span>Save and edit invoices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    <span>Store client information</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    <span>Create and manage contracts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    <span>Choose currency and language</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    <span>Email invoices directly</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col p-6 pt-0">
                <Button variant="solid" color="secondary">
                  <Link href={SIGN_UP_PAGE}>Upgrade Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {renderDivider()}

        <section className="max-w-7xl mx-auto w-full px-6 py-12 md:py-24 lg:py-32 bg-muted">
          <div className="grid gap-12 md:gap-16 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to streamline your invoicing process?
              </h2>
              <p className="text-muted-foreground md:text-xl">
                Start creating professional invoices today, no credit card
                required.
              </p>
              <Button size="lg" className="px-8">
                <Link href={CREATE_INVOICE_PAGE}>Try For Free</Link>
              </Button>
            </div>
            <div className="flex flex-col items-start space-y-4">
              <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">
                Testimonial
              </div>
              <blockquote className="text-lg font-semibold">
                "InvoiceTrackr has completely transformed how I handle
                invoicing. The free version is great to start, but the premium
                features save me hours every month."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-muted-foreground/20 p-1">
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
                    className="h-10 w-10 text-muted-foreground/70"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Nikita K.</div>
                  <div className="text-sm text-muted-foreground">
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
