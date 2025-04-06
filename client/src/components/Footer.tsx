"use client";

import { Link } from "@heroui/react";
import { usePathname } from "next/navigation";

import {
  HOME_PAGE,
  PRIVACY_POLICY_PAGE,
  TERMS_OF_SERVICE_PAGE,
} from "@/lib/constants/pages";

import AppLogo from "./icons/AppLogo";

const Footer = () => {
  const pathname = usePathname();

  return (
    <footer className="flex justify-center items-center flex-col">
      {pathname === HOME_PAGE && (
        <div className="border-t-1 border-default-300 dark:border-default-100 w-full gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="flex flex-col gap-8 sm:flex-row justify-between text-center sm:text-start items-center max-w-7xl w-full m-auto px-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 mx-auto sm:mx-0">
                <AppLogo />
                <p className="font-bold text-inherit">
                  INVOICE<span className="text-secondary-600">TRACKR</span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Simple, powerful invoicing for freelancers and small businesses.
              </p>
            </div>
            <div className="md:ml-auto grid gap-8 sm:grid-cols-2">
              <div className="grid gap-3 text-sm">
                <div className="font-medium">Legal</div>
                <nav className="grid gap-2">
                  <Link
                    color="foreground"
                    href={PRIVACY_POLICY_PAGE}
                    className="text-sm hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    color="foreground"
                    href={TERMS_OF_SERVICE_PAGE}
                    className="text-sm hover:underline"
                  >
                    Terms of Service
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="w-full flex flex-col gap-4 border-t-1 border-t-default-300 dark:border-t-default-100 py-6 md:flex-row md:items-center">
        <div className="flex w-full justify-center items-center px-6 max-w-7xl mx-auto">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} InvoiceTrackr. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
