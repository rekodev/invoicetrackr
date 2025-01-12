"use client";

import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";

import {
  DASHBOARD_PAGE,
  LOGIN_PAGE,
  SIGN_UP_PAGE,
} from "@/lib/constants/pages";
import { scrollToElement } from "@/lib/utils/scrollToElement";

import AppLogo from "../icons/AppLogo.jsx";

const navbarItems = [
  { name: "Features", onClick: () => scrollToElement("#features", 60) },
  { name: "Pricing", onClick: () => scrollToElement("#pricing", 60) },
  { name: "FAQ", onClick: () => scrollToElement("#faq", 60) },
  { name: "Get Started", onClick: () => scrollToElement("#get-started", 60) },
];

export default function GuestHeader() {
  return (
    <Navbar isBordered>
      <NavbarBrand
        className="text-white flex gap-2"
        as={Link}
        href={DASHBOARD_PAGE}
      >
        <AppLogo />
        <p className="font-bold text-inherit">
          INVOICE<span className="text-secondary-600">TRACKR</span>
        </p>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navbarItems.map((item, index) => {
          return (
            <NavbarItem className="cursor-pointer" key={index}>
              <Link
                onPress={() => item.onClick()}
                aria-current="page"
                color="foreground"
              >
                {item.name}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent as="div" justify="end">
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
