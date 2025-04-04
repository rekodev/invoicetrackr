import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";

import { HeroUIProvider } from "@/components/providers/hero-ui-provider";
import SWRProvider from "@/components/providers/swr-provider";
import ThemeProvider from "@/components/providers/theme-provider";

type Props = {
  children: ReactNode;
  messages: AbstractIntlMessages;
};

export function Providers({ children, messages }: Props) {
  return (
    <NextIntlClientProvider messages={messages}>
      <HeroUIProvider>
        <ThemeProvider>
          <SWRProvider>{children}</SWRProvider>
        </ThemeProvider>
      </HeroUIProvider>
    </NextIntlClientProvider>
  );
}
