"use client";

import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { usePathname } from "next/navigation";

import {
  CREATE_INVOICE_PAGE,
  DASHBOARD_PAGE,
  HOME_PAGE,
  LOGIN_PAGE,
  SIGN_UP_PAGE,
} from "@/lib/constants/pages";

import AppLogo from "../icons/AppLogo.jsx";

const navbarItems = [
  { name: "Features", href: "#" },
  { name: "Customers", href: "#" },
  { name: "Pricing", href: "#" },
  { name: "Company", href: "#" },
];

export default function GuestHeader() {
  const pathname = usePathname();

  return (
    <Navbar isBordered>
      <NavbarBrand className="text-white flex gap-2" as={Link} href={HOME_PAGE}>
        <AppLogo />
        <p className="font-bold text-inherit">
          INVOICE<span className="text-secondary-600">TRACKR</span>
        </p>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navbarItems.map((item, index) => {
          const isActive = pathname?.includes(item.href);

          return (
            <NavbarItem key={index} isActive={isActive}>
              <Link
                href={item.href}
                aria-current="page"
                color={isActive ? "secondary" : "foreground"}
              >
                {item.name}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent as="div" justify="end">
        <NavbarItem className="border-r border-default-100 pr-4 hidden lg:flex">
          <Button
            as={Link}
            color="secondary"
            variant="faded"
            href={CREATE_INVOICE_PAGE}
          >
            Create Invoice
          </Button>
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">
          <Link color="secondary" href={LOGIN_PAGE}>
            Login
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            href={SIGN_UP_PAGE}
            color="secondary"
            variant="flat"
          >
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
