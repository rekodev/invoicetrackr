"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import { Button, Input } from "@nextui-org/react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="mx-auto px-6 pb-12 max-w-5xl flex gap-1 flex-col align-center justify-between w-full sm:flex-row mt-6">
      <div className="pt-3 flex flex-col gap-3">
        <div className="max-w-xl">
          <h1 className="inline text-5xl font-semibold">
            The modern landing page for{" "}
            <span className="text-secondary-500">React developers</span>
          </h1>
        </div>

        <p className="text-default-500 text-lg my-2 max-w-sm">
          The easiest way to build React Landing page in seconds. Save time and
          focus on your project.
        </p>

        <div className="flex gap-2 pt-1">
          <Input className="w-1/2" placeholder="Enter your email address" />
          <Button className="bg-secondary-500">Start Free Trial</Button>
        </div>

        <div className="flex flex-wrap gap-2 py-2 sm:py-1">
          <div className="flex text-default-500 items-center">
            <CheckIcon className="h-5 w-5 text-success-500" /> No credit card
            required.
          </div>
          <div className="flex text-default-500 items-center">
            <CheckIcon className="h-5 w-5 text-success-500" /> 14-day free
            trial.
          </div>
          <div className="flex text-default-500 items-center">
            <CheckIcon className="h-5 w-5 text-success-500" /> Cancel anytime.
          </div>
        </div>
      </div>
      <div className="md:-mr-3 mt-5 self-center">
        <Image
          className="object-contain"
          height={374}
          width={570}
          src="/mock.png"
          alt="Mock"
        />
      </div>
    </section>
  );
}
