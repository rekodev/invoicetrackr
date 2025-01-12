"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@nextui-org/react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type Feature = {
  isDisabled?: boolean;
  description: string;
};

type PlanCard = {
  title: string;
  ctaButtonText: string;
  description: string;
  price: number;
  features: Array<Feature>;
  isDisabled?: boolean;
  renderedChip?: ReactNode;
};

const planCards: Array<PlanCard> = [
  {
    title: "Individual",
    ctaButtonText: "Join as Individual",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed condimentum, nisl ut aliquam lacinia, elit",
    price: 5,
    features: [
      { description: "Track Your Income Effortlessly" },
      { description: "Create and Customize Professional Invoices" },
      { description: "Easily Manage Clients and Contracts", isDisabled: true },
      { description: "Email Invoices to Clients", isDisabled: true },
      { description: "Collect Digital Signatures Instantly", isDisabled: true },
    ],
  },
  {
    title: "Business",
    ctaButtonText: "Start Your Business Plan",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed condimentum, nisl ut aliquam lacinia, elit",
    price: 15,
    features: [
      { description: "Track Your Income Effortlessly" },
      { description: "Create and Customize Professional Invoices" },
      { description: "Easily Manage Clients and Contracts" },
      { description: "Email Invoices to Clients" },
      { description: "Collect Digital Signatures Instantly" },
    ],
  },
];

export default function Plans() {
  const renderPlanCard = ({
    title,
    description,
    price,
    features,
    isDisabled,
    renderedChip,
  }: PlanCard) => (
    <div
      key={title}
      className={cn(
        "flex flex-col max-w-96 p-6 gap-4 bg-default-100 border border-secondary-500 bg-opacity-50 backdrop-blur-lg rounded-lg border-opacity-50",
        { "border-none": !!isDisabled },
      )}
    >
      <div className="flex flex-col gap-1 px-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-semibold">{title}</h4>
          {renderedChip}
        </div>
        <p className="text-default-500">{description}</p>
      </div>
      <p className="text-4xl font-semibold">
        ${price}
        <span className="text-default-500 text-sm">/mo</span>
      </p>
      <Button className="bg-secondary-500" isDisabled={isDisabled}>
        Get Started
      </Button>
      <div className="border-default-400 border-t w-full my-2" />
      <ul className="flex flex-col gap-4 px-4 pb-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-1">
            <CheckIcon
              className={cn("w-5 h-5 text-success-500", {
                "text-default-500": feature.isDisabled,
              })}
            />{" "}
            <span className="text-default-500">{feature.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section
      id="pricing"
      className="max-w-5xl flex justify-center flex-wrap items-center flex-col py-12 gap-8 px-6"
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-secondary-500">Awesome Feature</span>
        <h2 className="text-4xl font-semibold">Flexible Plans</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {planCards.map((card, index) =>
          renderPlanCard({
            title: card.title,
            ctaButtonText: card.ctaButtonText,
            description: card.description,
            isDisabled: index === 1,
            features: card.features,
            price: card.price,
            renderedChip:
              index === 1 ? (
                <div className="text-sm rounded-3xl -mr-3 bg-secondary-200 bg-opacity-50 px-3 py-1 text-secondary-700">
                  Coming Soon
                </div>
              ) : undefined,
          }),
        )}
      </div>
    </section>
  );
}
