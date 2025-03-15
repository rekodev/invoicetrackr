import Link from "next/link";

import AppLogo from "./icons/AppLogo";

const Footer = () => {
  return (
    <footer className="border-t-1 border-t-default-100 flex justify-center items-center flex-col">
      <div className="px-6 flex flex-col content-between justify-between w-full max-w-5xl gap-4 py-10 md:flex-row md:gap-8 md:py-12">
        <div className="flex flex-col gap-2 md:gap-4 lg:gap-6">
          <div className="flex items-center gap-2">
            <AppLogo />
            <p className="font-bold text-inherit">
              INVOICE<span className="text-secondary-600">TRACKR</span>
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Simple, powerful invoicing for freelancers and small businesses.
          </p>
        </div>
        <div className="md:ml-auto grid gap-8 sm:grid-cols-3">
          <div className="grid gap-3 text-sm">
            <div className="font-medium">Product</div>
            <nav className="grid gap-2">
              <Link href="#" className="hover:underline">
                Features
              </Link>
              <Link href="#" className="hover:underline">
                Pricing
              </Link>
              <Link href="#" className="hover:underline">
                Templates
              </Link>
            </nav>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="font-medium">Resources</div>
            <nav className="grid gap-2">
              <Link href="#" className="hover:underline">
                Blog
              </Link>
              <Link href="#" className="hover:underline">
                Help Center
              </Link>
              <Link href="#" className="hover:underline">
                Contact
              </Link>
            </nav>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="font-medium">Legal</div>
            <nav className="grid gap-2">
              <Link href="#" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:underline">
                Terms of Service
              </Link>
              <Link href="#" className="hover:underline">
                Cookie Policy
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-4 border-t-1 border-t-default-100 py-6 md:flex-row md:items-center">
        <div className="flex w-full items-center px-6 max-w-5xl mx-auto">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} InvoiceTrackr. All rights reserved.
          </div>
          <div className="md:ml-auto flex gap-4">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
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
                className="h-5 w-5"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
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
                className="h-5 w-5"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              <span className="sr-only">Facebook</span>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
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
                className="h-5 w-5"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span className="sr-only">Instagram</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
