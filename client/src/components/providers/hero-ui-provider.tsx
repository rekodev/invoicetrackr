"use client";

import { HeroUIProvider as HeroUIProviderFromLib } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export function HeroUIProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <HeroUIProviderFromLib
      navigate={router.push}
      className="flex flex-col min-h-screen justify-between"
    >
      {children}
    </HeroUIProviderFromLib>
  );
}
