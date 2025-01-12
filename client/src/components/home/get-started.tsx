"use client";

import { Button } from "@nextui-org/react";

export default function GetStarted() {
  return (
    <section
      id="get-started"
      className="px-6 w-full py-12 text-center max-w-96 flex flex-col items-center gap-2"
    >
      <h3 className="text-2xl font-semibold">Get Started Today</h3>
      <p className="text-default-500 min-w-[400px]">
        Start creating invoices and tracking your income today!
      </p>
      <Button variant="shadow" className="bg-secondary-500 mt-6">
        Get Started
      </Button>
    </section>
  );
}
