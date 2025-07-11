import {
  UserIcon,
  CreditCardIcon,
  LockClosedIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

import {
  ACCOUNT_SETTINGS_PAGE,
  BANKING_INFORMATION_PAGE,
  CHANGE_PASSWORD_PAGE,
  PERSONAL_INFORMATION_PAGE
} from './pages';

export const profileMenuTabs = [
  {
    key: 'personal-information',
    name: 'Personal Information',
    icon: <UserIcon className="h-4 w-4" />,
    href: PERSONAL_INFORMATION_PAGE
  },
  {
    key: 'banking-information',
    name: 'Banking Information',
    icon: <CreditCardIcon className="h-4 w-4" />,
    href: BANKING_INFORMATION_PAGE
  },
  {
    key: 'change-password',
    name: 'Change Password',
    icon: <LockClosedIcon className="h-4 w-4" />,
    href: CHANGE_PASSWORD_PAGE
  },
  {
    key: 'account-settings',
    name: 'Account Settings',
    icon: <Cog6ToothIcon className="h-4 w-4" />,
    href: ACCOUNT_SETTINGS_PAGE
  }
];
