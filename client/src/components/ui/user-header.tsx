"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { logOut } from "@/lib/actions";
import {
  CLIENTS_PAGE,
  CONTRACTS_PAGE,
  DASHBOARD_PAGE,
  HOME_PAGE,
  INVOICES_PAGE,
  PERSONAL_INFORMATION_PAGE,
} from "@/lib/constants/pages";
import { UserModel } from "@/lib/types/models/user";

import ThemeSwitcher from "./theme-switcher";
import AppLogo from "../icons/AppLogo";

const navbarItems = [
  { name: "Dashboard", href: DASHBOARD_PAGE },
  { name: "Invoices", href: INVOICES_PAGE },
  { name: "Contracts", href: CONTRACTS_PAGE },
  { name: "Clients", href: CLIENTS_PAGE },
];

type Props = {
  user: Partial<UserModel>;
};

export default function UserHeader({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  console.log({ user });

  const navigateToProfilePage = () => {
    router.push(PERSONAL_INFORMATION_PAGE);
  };

  const renderMobileNavbarContent = () => (
    <Dropdown>
      <DropdownTrigger className="md:hidden">
        <Button isIconOnly variant="faded" color="secondary">
          <Bars3Icon className="w-5 h-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        {navbarItems.map((item, index) => {
          const isActive = pathname?.includes(item.href);

          return (
            <DropdownItem
              as={Link}
              className={cn("text-default-800", {
                "text-secondary-500": isActive,
              })}
              href={item.href}
              color={isActive ? "secondary" : "default"}
              key={`mobile-${index}`}
            >
              {item.name}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <Navbar isBordered>
      <NavbarBrand className="text-white flex gap-2" as={Link} href={HOME_PAGE}>
        <AppLogo />
        <p className="font-bold text-default-800">
          INVOICE
          <span className="text-secondary-400 dark:text-secondary-600">
            TRACKR
          </span>
        </p>
      </NavbarBrand>

      <NavbarContent className="hidden md:flex gap-4" justify="center">
        {navbarItems.map((item, index) => {
          const isActive = pathname?.includes(item.href);

          return (
            <NavbarItem key={index} isActive={isActive}>
              <Link
                href={item.href}
                aria-current="page"
                className={cn("text-foreground", {
                  "text-secondary": isActive,
                })}
              >
                {item.name}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent as="div" justify="end">
        {renderMobileNavbarContent()}
        <div className="md:hidden h-full py-3">
          <div className="border-r border-default-300 dark:border-default-100 h-full" />
        </div>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered={pathname?.includes("profile")}
              as="button"
              className="transition-transform"
              color="secondary"
              name={user.name}
              size="sm"
              src={user.profilePictureUrl}
            />
          </DropdownTrigger>
          <form action={logOut}>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="signed-in-as" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user.email}</p>
              </DropdownItem>
              <DropdownItem key="profile" onPress={navigateToProfilePage}>
                My Profile
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                as="button"
                itemType="submit"
                className="text-left"
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </form>
        </Dropdown>
        <NavbarItem className="border-l border-default-300 dark:border-default-100 pl-4">
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
