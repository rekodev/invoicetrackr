'use client';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@heroui/react";
import { usePathname, useRouter } from 'next/navigation';

import { logOut } from '@/lib/actions';
import {
  CLIENTS_PAGE,
  CONTRACTS_PAGE,
  DASHBOARD_PAGE,
  HOME_PAGE,
  INVOICES_PAGE,
  PERSONAL_INFORMATION_PAGE,
} from '@/lib/constants/pages';
import useGetUser from '@/lib/hooks/user/useGetUser';

import AppLogo from '../icons/AppLogo.jsx';

const navbarItems = [
  { name: 'Dashboard', href: DASHBOARD_PAGE },
  { name: 'Invoices', href: INVOICES_PAGE },
  { name: 'Contracts', href: CONTRACTS_PAGE },
  { name: 'Clients', href: CLIENTS_PAGE },
];

type Props = {
  userId: number;
};

export default function UserHeader({ userId }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useGetUser({ userId });

  const navigateToProfilePage = () => {
    router.push(PERSONAL_INFORMATION_PAGE);
  };

  return (
    <Navbar isBordered>
      <NavbarBrand className='text-white flex gap-2' as={Link} href={HOME_PAGE}>
        <AppLogo />
        <p className='font-bold text-inherit'>
          INVOICE<span className='text-secondary-600'>TRACKR</span>
        </p>
      </NavbarBrand>

      <NavbarContent className='hidden sm:flex gap-4' justify='center'>
        {navbarItems.map((item, index) => {
          const isActive = pathname?.includes(item.href);

          return (
            <NavbarItem key={index} isActive={isActive}>
              <Link
                href={item.href}
                aria-current='page'
                color={isActive ? 'secondary' : 'foreground'}
              >
                {item.name}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent as='div' justify='end'>
        <Dropdown placement='bottom-end'>
          <DropdownTrigger>
            <Avatar
              isBordered={pathname?.includes('profile')}
              as='button'
              className='transition-transform'
              color='secondary'
              name={user?.name}
              size='sm'
              src={user?.profilePictureUrl}
            />
          </DropdownTrigger>
          <form action={logOut}>
            <DropdownMenu aria-label='Profile Actions' variant='flat'>
              <DropdownItem key='signed-in-as' className='h-14 gap-2'>
                <p className='font-semibold'>Signed in as</p>
                <p className='font-semibold'>{user?.email}</p>
              </DropdownItem>
              <DropdownItem key='profile' onPress={navigateToProfilePage}>
                My Profile
              </DropdownItem>
              <DropdownItem
                key='logout'
                color='danger'
                as='button'
                itemType='submit'
                className='text-left'
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </form>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
